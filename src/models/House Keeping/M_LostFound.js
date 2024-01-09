const { ThrowError, PrismaDisconnect } = require("../../utils/helper");
const { prisma } = require("../../../prisma/seeder/config");

/**
 * @typedef {object} GetAllLostFoundOption
 * @property {number} page
 * @property {number} show
 * @property {string} sort
 * @property {'asc'|'desc'} order
 * @property {string} description
 * @property {Date} date
 */

/**
 * @typedef {object} GetAllLostFoundResult
 * @property {number} total
 * @property {import('@prisma/client').LostFound[]} lostFounds
 */

const select = {
  created_at: true,
  time: true,
  roomId: true,
  pic: {
    select: {
      name: true,
    }
  },
  description: true,
  user: {
    select: {
      name: true,
      phone: true,
    }
  },
  reportedDate: true,
  location: true,
  image: true,
}

/**
 * @param {GetAllLostFoundOption} option
 * @throws {Error}
 * @return {Promise<GetAllLostFoundResult>}
 */
async function all(option) {
  try {
    const { page, show, description, date } = option

    const where = {
      description: {
        contains: description,
      },
      reportedDate: date,
      deleted: false,
    }

    const [total, lostFounds, found, lost, onProgress] = await prisma.$transaction([
      prisma.lostFound.count({ where }),
      prisma.lostFound.findMany({
        take: show,
        skip: (page - 1) * show,
        where,
        orderBy: {
          roomId: 'asc',
        },
        select
      }),
      prisma.lostFound.count({ where: { status: 'FOUND' } }),
      prisma.lostFound.count({ where: { status: 'LOST' } }),
      prisma.lostFound.count({ where: { status: 'ONPROGRESS' } }),
    ])

    return { lostFounds, total, found, lost, onProgress }

  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

/**
 * @param {string} id
 * @throws {Error}
 * @return {Promise<import('@prisma/client').LostFound>}
 */
async function get(id) {
  try {
    return await prisma.lostFound.findUniqueOrThrow({
      where: {
        id: +id,
        deleted: false,
      },
      select
    })
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

/**
 * @param {import('@prisma/client').LostFound} lostFound
 * @param {string} image
 * @param {string} userId
 * @throws {Error}
 * @return {Promise<import('@prisma/client').LostFound>}
 */
async function create(lostFound, image, userId) {
  try{
    const roomId = lostFound.roomId
    delete lostFound.roomId
    return await prisma.lostFound.create({
      data: {
        ...lostFound,
        image,
        room: {
          connect: {
            id: roomId,
          }
        },
        pic: {
          connect: {
            id: +userId
          }
        },
        user: {
          connect: {
            id: +userId
          }
        }
      },
      select
    })
  }catch(err){
    ThrowError(err)
  }finally{
    await PrismaDisconnect()
  }
}

/**
 * @param {string} id
 * @param {import('@prisma/client').LostFound} lostFound
 * @throws {Error}
 * @return {Promise<import('@prisma/client').LostFound>}
 */
async function update(id, lostFound) {
  return await prisma.lostFound.update({
    where: {
      id: +id,
      deleted: false,
    },
    data: lostFound,
    select
  })
}

/**
 * @param {string} id
 * @throws {Error}
 * @return {Promise<import('@prisma/client').LostFound>}
 */
async function softDelete(id) {
  return await prisma.lostFound.update({
    where: {
      id: +id,
      deleted: false,
    },
    data: {
      deleted: true,
    },
    select
  })
}

module.exports = {
  all,
  get,
  create,
  update,
  softDelete,
}
