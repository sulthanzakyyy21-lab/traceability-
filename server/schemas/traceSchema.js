const { z } = require('zod');

/**
 * Zod schema for /api/trace query parameters
 * Guarantees type safety and rejects invalid or missing parameters.
 */
const TraceQuerySchema = z.object({
  noBatchFull: z.string().optional(),
  batch: z.string().optional(),
  noBatch: z.string().optional(),
  tower: z.enum(['1', '2'], {
    errorMap: () => ({ message: 'Parameter tower harus bernilai 1 atau 2.' }),
  }),
  tglProduksi: z.string().optional().nullable(),
  totalOutput: z.coerce.number().positive('totalOutput harus angka positif.').optional().nullable(),
}).transform(data => {
  const full = data.noBatchFull || data.noBatch || data.batch || '';
  return {
    ...data,
    noBatchFull: full.trim(),
  };
}).refine(data => data.noBatchFull.length > 0, {
  message: 'Parameter noBatchFull / batch wajib diisi.',
  path: ['noBatchFull'],
});

module.exports = {
  TraceQuerySchema,
};

