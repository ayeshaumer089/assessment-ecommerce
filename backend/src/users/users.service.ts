import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(_dto: CreateUserDto): Promise<UserDocument> {
    // TODO: implement
    throw new Error('Not implemented');
  }

  async findAll(): Promise<UserDocument[]> {
    // TODO: implement
    throw new Error('Not implemented');
  }

  async findById(_id: string): Promise<UserDocument> {
    // TODO: implement
    throw new Error('Not implemented');
  }

  async findByEmail(_email: string): Promise<UserDocument | null> {
    // TODO: implement
    return null;
  }

  async findByUsername(_username: string): Promise<UserDocument | null> {
    // TODO: implement
    return null;
  }

  async findByEmailOrUsername(_identifier: string): Promise<UserDocument | null> {
    // TODO: implement
    return null;
  }

  async update(_id: string, _dto: UpdateUserDto): Promise<UserDocument> {
    // TODO: implement
    throw new Error('Not implemented');
  }

  async remove(_id: string): Promise<void> {
    // TODO: implement
  }

  async updateRefreshToken(_id: string, _token: string | null): Promise<void> {
    // TODO: implement
  }
}
