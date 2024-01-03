import { z } from 'zod'
import { error } from '#utils/response.js'

/**
 * @param {object} schema
 */
export default function validate(schema) {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  return async (req, res, next) => {

    if (typeof schema === 'function') {
      schema = schema(req.params.id)
    }

    try {
      if (req.method === 'GET') {
        req.query = await z
          .object(schema)
          .strict()
          .parseAsync(req.query)
      } else {
        req.body = await z
          .object(schema)
          .strict()
          .parseAsync(req.body)
      }

    } catch(e) {
      return error(res, 'Validation error', 422, e.errors);
    }

    next()
   }
}
