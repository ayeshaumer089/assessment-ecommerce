import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<CategoryDocument> {
    const slug = slugify(dto.name);

    const existing = await this.categoryModel
      .findOne({ $or: [{ slug }, { name: dto.name }] })
      .exec();
    if (existing) {
      throw new ConflictException('A category with this name already exists');
    }

    const category = new this.categoryModel({ ...dto, slug });
    return category.save();
  }

  async findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel
      .find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async findOne(id: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findBySlug(slug: string): Promise<CategoryDocument | null> {
    return this.categoryModel.findOne({ slug }).exec();
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryDocument> {
    const update: Record<string, unknown> = { ...dto };

    // Regenerate the slug whenever the name changes, guarding uniqueness.
    if (dto.name) {
      const slug = slugify(dto.name);
      const clash = await this.categoryModel
        .findOne({ slug, _id: { $ne: id } })
        .exec();
      if (clash) {
        throw new ConflictException('A category with this name already exists');
      }
      update.slug = slug;
    }

    const category = await this.categoryModel
      .findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Category not found');
  }
}

/** Converts a display name into a URL-safe slug, e.g. "Home & Garden" → "home-garden". */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
