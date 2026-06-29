import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

/** Recursively serialize Mongoose documents to plain objects via toJSON() */
function serialize(value: any): any {
  if (value === null || value === undefined) return value;
  if (typeof value?.toJSON === 'function') return serialize(value.toJSON());
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === 'object' && !Buffer.isBuffer(value)) {
    const out: any = {};
    for (const key of Object.keys(value)) {
      out[key] = serialize(value[key]);
    }
    return out;
  }
  return value;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((payload) => {
        const serialized = serialize(payload);
        if (serialized && typeof serialized === 'object' && 'data' in serialized) {
          return {
            success: true,
            data: serialized.data,
            message: serialized.message,
            meta: serialized.meta,
          };
        }
        return {
          success: true,
          data: serialized,
        };
      }),
    );
  }
}
