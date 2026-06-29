import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(_dto: CreateProductDto): Promise<ProductDocument> {
    // TODO: implement
    throw new Error('Not implemented');
  }

  async findAll(_query: QueryProductDto): Promise<{ data: ProductDocument[]; meta: any }> {
    // TODO: implement with pagination, filtering, text search
    throw new Error('Not implemented');
  }

  async findOne(_id: string): Promise<ProductDocument> {
    // TODO: implement — populate category
    throw new Error('Not implemented');
  }

  async update(_id: string, _dto: UpdateProductDto): Promise<ProductDocument> {
    // TODO: implement
    throw new Error('Not implemented');
  }

  async remove(_id: string): Promise<void> {
    // TODO: implement (soft-delete: set isActive = false)
  }

  async search(_query: string): Promise<ProductDocument[]> {
    // TODO: implement full-text search
    throw new Error('Not implemented');
  }

  async findByCategory(_categoryId: string): Promise<ProductDocument[]> {
    // TODO: implement
    throw new Error('Not implemented');
  }

  async getFeatured(_limit?: number): Promise<ProductDocument[]> {
    // TODO: implement
    throw new Error('Not implemented');
  }
}
