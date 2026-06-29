import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(_dto: CreateCategoryDto): Promise<CategoryDocument> {
    // TODO: auto-generate slug from name, check uniqueness
    throw new Error('Not implemented');
  }

  async findAll(): Promise<CategoryDocument[]> {
    // TODO: implement — return tree or flat list
    throw new Error('Not implemented');
  }

  async findOne(_id: string): Promise<CategoryDocument> {
    // TODO: implement
    throw new Error('Not implemented');
  }

  async findBySlug(_slug: string): Promise<CategoryDocument | null> {
    // TODO: implement
    return null;
  }

  async update(_id: string, _dto: UpdateCategoryDto): Promise<CategoryDocument> {
    // TODO: implement — regenerate slug if name changes
    throw new Error('Not implemented');
  }

  async remove(_id: string): Promise<void> {
    // TODO: implement — check for products in category first
  }
}
