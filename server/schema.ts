import { COLORS, FONTS } from '../src/services/types.js';
export const idSchema = { type: 'string', pattern: '^[1-9][0-9]{0,18}$' };
const point = {
  type: 'object',
  additionalProperties: false,
  required: ['x', 'y'],
  properties: {
    x: { type: 'number', minimum: 0, maximum: 1 },
    y: { type: 'number', minimum: 0, maximum: 1 },
  },
};
export const signatureSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'kind', 'color', 'font'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 40 },
    kind: { enum: ['text', 'drawing'] },
    color: { enum: COLORS },
    font: { enum: FONTS },
    strokes: {
      type: 'array',
      minItems: 1,
      maxItems: 64,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['width', 'points'],
        properties: {
          width: { type: 'number', minimum: 1, maximum: 12 },
          points: { type: 'array', minItems: 2, maxItems: 256, items: point },
        },
      },
    },
  },
  allOf: [
    {
      if: { properties: { kind: { const: 'drawing' } } },
      then: { required: ['strokes'] },
      else: { not: { required: ['strokes'] } },
    },
  ],
};
