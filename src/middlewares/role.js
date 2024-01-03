import { error } from '#utils/response.js'

/**
 * @param {string[]} roles
 */
export default function role(...roles) {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  return (req, res, next) => {

    if (!roles.includes(req.user.role.name)) {
      return error(res, 'Unauthorized', 403)
    }

    next()
  }
}
