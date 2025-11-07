import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema<any>) {}

  transform(value: any) {
    try {
      const parsed = this.schema.parse(value);
      return parsed;
    } catch (err) {
      if (err instanceof ZodError) {
        throw new BadRequestException(err.errors.map(e => ({ path: e.path, message: e.message })));
      }
      throw err;
    }
  }
}
