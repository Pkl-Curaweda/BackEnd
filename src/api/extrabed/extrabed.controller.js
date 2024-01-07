const prisma = require('../../db/db.js');
const { error, success } = require('../../utils/response.js');


/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
 async function findAll(req, res) {
  const {
    page,
    show,
    sort,
    order,
    from,
    to,
  } = req.query

  const where = {
        date: {
          gte: from,
          lte: to,
      },
  }

  const [count, extraBeds] = await prisma.$transaction([
    prisma.extraBed.count({ where }),
    prisma.extraBed.findMany({
      take: show,
      skip: (page - 1) * show,
      where,
      orderBy: {
        [sort]: order,
      }
    })
  ])

  const lastPage = Math.ceil(count / show);
  return success(res, 'Find all extrabed success', { lastPage, extraBeds, count })
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
 async function findOne(req, res) {
  try {
    const extraBed = await prisma.extraBed.findUniqueOrThrow({
      where: {
        id: parseInt(req.params.id)
      }
    })

    return success(res, 'Find one extrabed success', extraBed)

  } catch {
    return error(res, 'extrabed not found', 404)
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
 async function create(req, res) {
  try {
    const extraBed = await prisma.extraBed.create({
      data: req.body
    })

    return success(res, 'Create extrabed success', extraBed)

  } catch {
    return error(res, 'Create extrabed failed')
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
 async function update(req, res) {
  try {
    const extraBed = await prisma.extraBed.update({
      where: {
        id: parseInt(req.params.id)
      },
      data: req.body
    })

    return success(res, 'Update extrabed success', extraBed)

  } catch {
    return error(res, 'Update extrabed failed')
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
 async function remove(req, res) {
  try {
    await prisma.extraBed.delete({
      where: {
        id: parseInt(req.params.id )
      }
    })
  } catch {
    return error(res, 'extrabed not found', 404)
  }

  return success(res, 'Delete extrabed success')
}

module.exports = { findAll, findOne, create, update, remove }