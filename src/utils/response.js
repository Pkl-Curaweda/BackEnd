/**
 * @param {import('express').Response} res
 * @param {string} message
 * @param {any} data
 * @returns {import('express').Response}
 */
function success(res, message, data, status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

/**
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} code
 * @param {any} data
 * @returns {import('express').Response}
 */
function error(res, message, code = 400, data) {
  return res.status(code).json({
    success: false,
    message,
    data,
  });
}

module.exports = { success, error };
