import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Role } from '../enums/role.enum';

export type UserDocument = HydratedDocument<User> & {
  comparePassword(candidate: string): Promise<boolean>;
};

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({
    required: true,
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  })
  email: string;

  @Prop({
    required: true,
    select: false,
    minlength: [8, 'Password must be at least 8 characters'],
  })
  password: string;

  @Prop({
    type: String,
    enum: {
      values: Object.values(Role),
      message: 'Role must be one of: customer, admin',
    },
    default: Role.CUSTOMER,
  })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Note: the unique index on `email` is created by `unique: true` on the prop.

// ── Hash password before save ─────────────────────────────────────────────
UserSchema.pre('save', async function (this: UserDocument, next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: password comparison ──────────────────────────────────
UserSchema.methods.comparePassword = async function (
  this: UserDocument,
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// ── Strip sensitive fields from JSON output ───────────────────────────────
UserSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});
