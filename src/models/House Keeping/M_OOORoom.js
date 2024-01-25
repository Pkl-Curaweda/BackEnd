const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, splitDateTime } = require("../../utils/helper");

/**
 * @typedef {object} GetAlloooRoomOption
 * @property {number} page
 * @property {number} show
 * @property {string} query
 * @property {string} sort
 * @property {'asc'|'desc'} order
 * @property {Date} from
 * @property {Date} until
 */


const sortingOrderOOOOffRoom = (so) => {
  let orderBy
  try {
    switch (so) {
      case "department":
        orderBy = { department: { shortDesc: 'asc' } }
        break;
      case "reason":
        orderBy = { reason: 'asc' }
        break;
      case "pic":
        orderBy = { user: { name: 'asc' } }
        break;
      default:
        orderBy = { roomId: 'asc' }
        break;
    }
    return orderBy
  } catch (err) {
    ThrowError(err)
  }
}

/**
 * @typedef {object} GetAlloooRoomResult
 * @property {number} total
 * @property {import('@prisma/client').oooRoom[]} oooRoom
 */
const select = {
  roomId: true,
  reason: true,
  from: true,
  until: true,
  id: true,
  department: true,
  description: true,
}

/**
 * @param {GetAlloooRoomOption} option
 * @throws {Error}
 * @return {Promise<GetAlloooRoomResult>}
 */
async function all(option) {
  try {
    let { page = 1, perPage = 5, sortOrder, arr, dep } = option
    if (arr === undefined) arr = new Date().toISOString().split('T')[0]
    if (dep === undefined) {
      dep = new Date(arr);
      dep.setDate(dep.getDate() + 7);
      dep = dep.toISOString().split('T')[0]
    }
    if (sortOrder != undefined) sortOrder = sortingOrderOOOOffRoom(sortOrder)
    const where = {
      AND: [
        {
          from: { gte: `${arr}T00:00:00.000Z` },
        },
        {
          until: { lte: `${dep}T23:59:59.999Z` }
        }
      ]
    }
    const [total, oooRooms] = await prisma.$transaction([
      prisma.oooRoom.count({ where }),
      prisma.oooRoom.findMany({
        take: +perPage,
        skip: (page - 1) * perPage,
        orderBy: { ...sortOrder },
        select: {
          room: {
            select: { id: true, roomType: true }
          },
          reason: true,
          from: true,
          until: true,
          user: {
            select: { name: true }
          },
          department: {
            select: { shortDesc: true }
          }
        },
        where
      })
    ])

    const OOORoom = [];
    for(let ooo of oooRooms){
     OOORoom.push({
        roomNo: ooo.room.id,
        reason: ooo.reason,
        from: splitDateTime(ooo.from).date,
        until: splitDateTime(ooo.until).date,
        pic: ooo.user.name,
        department: ooo.department.shortDesc,
        roomType: ooo.room.roomType
      })
    }
    const lastPage = Math.ceil(total / perPage)
    return {
      OOORoom, meta: {
        total,
        currPage: +page,
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
 * @param {import('@prisma/client').oooRoom} oooRoom
 * @throws {Error}
 * @return {Promise<import('@prisma/client').oooRoom>}
 */
async function createOooRoom(oooRoom) {
  try {
    return await prisma.oooRoom.create({
      data: oooRoom,
    })
  } catch (e) {
    console.log(e);
    throw new Error
  }
}


/**
 * @param {string} id
 * @param {import('@prisma/client').oooRoom} oooRoom
 * @throws {Error}
 * @return {Promise<import('@prisma/client').oooRoom>}
 */
async function update(id, oooRoom) {
  try {
    return await prisma.oooRoom.update({
      where: {
        id: parseInt(id)
      },
      data: oooRoom,
      select
    })
  } catch {
    throw new Error
  }
}

/**
 * @param {string} id
 * @throws {Error}
 * @return {Promise<import('@prisma/client').oooRoom>}
 */
async function remove(id) {
  try {
    return await prisma.oooRoom.delete({
      where: {
        id: parseInt(id)
      },
      select
    })
  } catch {
    throw new Error
  }
}

module.exports = {
  all,
  createOooRoom,
  update,
  remove
}
