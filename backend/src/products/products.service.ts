import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, SortOrder } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto, ProductSortField } from './dto/query-product.dto';
import { RecommendationService } from './recommendation.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly recommendationService: RecommendationService,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductDocument> {
    const product = new this.productModel(dto);
    return product.save();
  }

  async findAll(
    query: QueryProductDto,
  ): Promise<{ data: any[]; meta: Record<string, unknown> }> {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = ProductSortField.CREATED_AT,
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = query;

    const filter: FilterQuery<ProductDocument> = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    const skip = (page - 1) * limit;

    // Text search: rank by relevance score first, then fall back to sortBy.
    // Regular queries: sort by the requested field.
    const sort: Record<string, SortOrder | { $meta: string }> = search
      ? { score: { $meta: 'textScore' }, [sortBy]: sortOrder as SortOrder }
      : { [sortBy]: sortOrder as SortOrder };

    const [data, total] = await Promise.all([
      this.productModel.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const product = await this.productModel.findById(id).lean().exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
    const product = await this.productModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Product not found');
  }

  async getFeatured(limit?: number | string): Promise<any[]> {
    const n = Number(limit) || 8;
    return this.productModel
      .find({ stock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(n)
      .lean()
      .exec();
  }

  async getRecommendations(
    id: string,
    limit?: number | string,
  ): Promise<ProductDocument[]> {
    const source = await this.findOne(id);
    return this.recommendationService.getRecommendations(source, Number(limit) || 6);
  }
}
