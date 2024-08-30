import { UnprocessableEntityException } from '@nestjs/common';
import { z } from 'zod';

export const zodRequestValidation = (schema: z.ZodObject<any>, payload) => {
  try {
    schema.parse(payload);
    return true;
  } catch(e) {
    const errorObj = JSON.parse(e?.message)?.[0];
    throw new UnprocessableEntityException(`Error: ${errorObj.code}: ${errorObj?.path?.join(',')} field value is invalid: ${errorObj?.message}`)
  }
}