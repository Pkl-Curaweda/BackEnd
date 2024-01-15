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

const sortingLostFound = (s) => {
  let orderBy
  try {
    switch (s) {
      case "pic":
        orderBy = {
          picId: 'asc'
        }
        break;
      case "reported":
        orderBy = {
          userId: 'asc'
        }
        orderBy
        break;
      case "date":
        orderBy = {
          created_at: 'asc'
        }
        break;
      default:
        orderBy = {
          roomId: 'asc'
        }
        break;
    }
    return orderBy
  } catch (err) {
    ThrowError(err)
  }
}

/**
 * @param {GetAllLostFoundOption} option
 * @throws {Error}
 * @return {Promise<GetAllLostFoundResult>}
 */
async function all(option) {
  let graph = { found: 0, lost: 0 }, orderBy
  try {
    let { page = 1, perPage = 5, search = '', date, sortOrder = '' } = option
    if (date === undefined) {
      date = new Date()
      date = date.toISOString().split('T')[0]
    }
    const where = {
      description: {
        contains: search,
      },
      reportedDate: {
        gte: `${date}T00:00:00.000Z`,
        lte: `${date}T23:59:59.999Z`,
      },
      deleted: false, //?Deleted = Done
    }
    orderBy = sortingLostFound(sortOrder)

    const [total, lostFounds, found, lost] = await prisma.$transaction([
      prisma.lostFound.count({ where }),
      prisma.lostFound.findMany({
        take: perPage,
        skip: (page - 1) * perPage,
        where,
        orderBy,
        select
      }),
      prisma.lostFound.count({ where: { status: 'FOUND' } }),
      prisma.lostFound.count({ where: { status: 'LOST' } })
    ])

    graph.found = found
    graph.lost = lost
    const lastPage = Math.ceil(total / perPage);
    return {
      graph, lostFounds, meta: {
        total,
        currPage: page,
        lastPage,
        perPage,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null
      }
    }

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
  try {
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
  } catch (err) {
    ThrowError(err)
  } finally {
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
  try {
    const [exist, updatedData] = await prisma.$transaction([
      prisma.lostFound.findFirstOrThrow({ where: { id } }),
      prisma.lostFound.update({
        where: {
          id,
          deleted: false,
        },
        data: lostFound,
        select
      })
    ])
    return updatedData
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
async function softDelete(id) {
  const [exist, updateDeleted] = await prisma.$transaction([
    prisma.lostFound.findFirstOrThrow({ where: { id } }),
    prisma.lostFound.update({
      where: {
        id,
        deleted: false,
      },
      data: {
        deleted: true,
      },
      select
    })
  ])
  return updateDeleted
}

async function remove(id) {
  try {
    const [exist, deleted] = await prisma.$transaction([
      prisma.lostFound.findFirstOrThrow({ where: { id } }),
      prisma.lostFound.delete({ where: { id }, select })
    ])
    return deleted
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

module.exports = {
  all,
  remove,
  create,
  update,
  softDelete,
}
