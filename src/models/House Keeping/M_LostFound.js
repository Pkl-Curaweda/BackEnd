const { ThrowError, PrismaDisconnect, splitDateTime } = require("../../utils/helper");
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
  roomId: true,
  pic: {
    select: {
      name: true,
    }
  },
  finished_at: true,
  description: true,
  pickerName: true,
  pickerEmail: true,
  pickerContact: true,
  pickerGender: true,
  pickerImage: true,
  ktpImage: true,
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
  let graph = { found: 0, lost: 0 }, orderBy, whereDate = {}
  try {
    let { page = 1, perPage = 5, search = '', searchDate, sortOrder = '' } = option
    if (searchDate != undefined){
      whereDate = {
        AND: [
          { created_at: { gte: `${searchDate}T00:00:00.000Z` } },
          { created_at: { lte: `${searchDate}T23:59:59.999Z` } },
        ],
      }
    }
    const where = {
      description: {
        contains: search,
      },
      ...whereDate,
      deleted: false,
    }
    orderBy = sortingLostFound(sortOrder)

    const [total, lostFounds, found, lost] = await prisma.$transaction([
      prisma.lostFound.count({ where }),
      prisma.lostFound.findMany({
        take: +perPage,
        skip: (page - 1) * perPage,
        where,
        orderBy,
        select: {
          id: true,
          created_at: true,
          roomId: true,
          pic: {
            select: {
              name: true,
            }
          },
          pickerName: true,
          pickerContact: true,
          pickerGender: true,
          pickerEmail: true,
          pickerImage: true,
          ktpImage: true,
          status: true,
          finished_at: true,
          description: true,//TODO: MIGRATE WITH DB
          location: true,
          image: true,
        }
      }),
      prisma.lostFound.count({ where: { status: 'FOUND' , deleted: false} }),
      prisma.lostFound.count({ where: { status: 'LOST', deleted: false } })
    ])

    graph.found = found
    graph.lost = lost
    const list = []
    for (let lf of lostFounds) {
      const { date, time } = splitDateTime(lf.created_at)
      list.push({
        id: lf.id,
        date, time,
        roomNo: lf.roomId,
        pic: lf.pic ? lf.pic.name : '-',
        desc: lf.description,
        pickerName: lf.pickerName ? lf.pickerName : "",
        pickerContact: lf.pickerContact ? lf.pickerContact : "",
        pickerEmail: lf.pickerEmail ? lf.pickerEmail : "",
        pickerGender: lf.pickerGender ? lf.pickerGender : "",
        pickerImage: lf.pickerImage ? lf.pickerImage : "",
        ktpImage: lf.ktpImage ? lf.ktpImage : "",
        status: lf.status,
        reportedDate: lf.finished_at != null ? splitDateTime(lf.finished_at).date : '-',
        location: lf.location || '-',
        image: lf.image
      })
    }
    const lastPage = Math.ceil(total / perPage);
    return {
      searchDate,
      graph, lostFounds: list, meta: {
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
 * @param {object} sender
 * @throws {Error}
 * @return {Promise<import('@prisma/client').LostFound>}
 */
async function create(lostFound, image, sender) {
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
          connect: { id: +sender.id }
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

const finishLostFound = async (lostFoundId, status, body) => {
  let update
  try {
    switch (status) {
      case "FOUND":
        update = {
          finished_at: new Date(),
          ...body
        }
        break;
      default:
        status = "LOST"
        update = {
          finished_at: null,
          pickerName: null,
          pickerContact: null,
          pickerEmail: null,
          pickerGender: null,
          pickerImage: null,
          ktpImage: null
        }
        break;
    }
    const [exist, lostFound] = await prisma.$transaction([
      prisma.lostFound.findFirstOrThrow({ where: { id: +lostFoundId } }),
      prisma.lostFound.update({ where: { id: +lostFoundId }, data: { ...update, status } })
    ])
    return lostFound
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
  finishLostFound,
  softDelete,
}
