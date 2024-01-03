/**
 * @param {number} length
 * @return {string}
 */
export function randomStr(length) {

  const chars ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = ''

  for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
  }

  return result;
}
