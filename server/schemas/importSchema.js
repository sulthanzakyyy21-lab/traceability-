const { z } = require('zod');
const { ALLOWED_TABLES } = require('../tableConfig');

const TableNameParamSchema = z.object({
  tableName: z.enum(ALLOWED_TABLES, {
    errorMap: () => ({ message: `Nama tabel tidak valid atau tidak diizinkan.` }),
  }),
});

const PicRowsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().optional().default(''),
});

const InspectBodySchema = z.object({
  pic: z.string().optional().nullable(),
  tower: z.string().optional().nullable(),
});

module.exports = {
  TableNameParamSchema,
  PicRowsQuerySchema,
  InspectBodySchema,
};
