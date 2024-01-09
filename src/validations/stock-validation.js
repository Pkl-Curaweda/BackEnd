const { z } = require('zod')
const validate = require('../middlewares/validation')

const getStockValidation = validate({
  page: z.coerce.number().default(1),
  take: z.coerce.number().default(5),
  query: z.string(),
  orderBy: z.string(),
  order: z.string(),
})

module.exports = { getStockValidation }