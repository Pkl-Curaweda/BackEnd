const { z } = require('zod');
const validate = require('../middlewares/validation')

const getDiscrepancyValidation = validate({
  page: z.coerce.number().optional().default(1),
  take: z.coerce.number().optional().default(5),
  query: z.string(),
  orderBy: z.string(),
  order: z.string(),
})

module.exports = { getDiscrepancyValidation }