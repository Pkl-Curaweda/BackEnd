const { z } = require('zod');
const { error } = require('../utils/response.js');

function validate(schema) {
  return async (req, res, next) => {
    try {
      if (typeof schema === 'function') schema = schema(req.params.id)
      if (req.method != "GET") {
        req.body = await z.object(schema).strict().parseAsync(req.body)
      } else req.query = await z.object(schema).strict().parseAsync(req.query)
      console.log(req.body)
    } catch (err) {
      console.log('sampe sini?')
      console.log(err)
      return error(res, err.errors[0].message, 422)
    }
    next()
  }
}
module.exports = validate
