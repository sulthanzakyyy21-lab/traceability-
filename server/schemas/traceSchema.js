const { z } = require('zod');

/**
 * Zod schema for /api/trace query parameters
 * Guarantees type safety and rejects invalid or missing parameters.
 */
const TraceQuerySchema = z.object({
  noBatchFull: z
    .string()
    .min(1, 'Parameter noBatchFull wajib diisi.')
    .regex(/^[A-Za-z0-9\/\-\.]+$/, 'Format noBatchFull tidak valid (contoh: A370/26, 370/26).'),
  tower: z.enum(['1', '2'], {
    errorMap: () => ({ message: 'Parameter tower harus bernilai 1 atau 2.' }),
  }),
  tglProduksi: z.string().optional().nullable(),
  totalOutput: z.coerce.number().positive('totalOutput harus angka positif.').optional().nullable(),
});

module.exports = {
  TraceQuerySchema,
};
