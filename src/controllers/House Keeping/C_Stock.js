

const {prisma} = require('../../../prisma/seeder/config')
const { error, success } = require('../../utils/response')

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function index(req, res) {
    try{
        const { page, take, query, orderBy, order } = req.body
      
        const stocks = await prisma.stock.findMany({
          take,
          skip: (page - 1) * 10,
          where: {
            OR: [
              { article: { contains: query } },
              { unit: { contains: query } },
              { description: { contains: query } },
              { content: { contains: query } },
              { d_unit: { contains: query } },
            ]
          },
          orderBy: {
            [orderBy]: order,
          }
        })
      
        const count = await prisma.stock.count()
        const lastPage = Math.ceil(count / take);
      
        return success(res, 'Get stocks success', { lastPage, stocks })
    }catch(err){
        return error(res, err.message)
    }
}

module.exports = { index }