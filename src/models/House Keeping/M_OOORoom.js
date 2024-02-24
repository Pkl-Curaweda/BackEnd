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
      case "roomNumber":
        orderBy = { roomId: 'asc' }
        break;
      default:
        orderBy = { created_at: 'desc'}
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
    let { page = 1, perPage = 5, sortOrder, arr, dep, type = "OOO" } = option
    if (arr === undefined) arr = new Date().toISOString().split('T')[0]
    if (dep === undefined) {
      dep = new Date(arr);
      dep.setDate(dep.getDate() + 7);
      dep = dep.toISOString().split('T')[0]
    }
    if (sortOrder != undefined) sortOrder = sortingOrderOOOOffRoom(sortOrder)
    const where = {
      xType: type,
      AND: [
        {
          from: { gte: `${arr}T00:00:00.000Z` },
        },
        {
          until: { lte: `${dep}T23:59:59.999Z` }
        }
      ]
    }
    const listOfDepartment = (await prisma.department.findMany({ select: { id: true, longDesc: true } })).map(dep => ({ id: dep.id, label: dep.longDesc }))
    const listOfRoom = await prisma.room.findMany({ where: { deleted: false, NOT: { id: 0 } }, select: { id: true } })
    const [total, oooRooms] = await prisma.$transaction([
      prisma.oooOmRoom.count({ where }),
      prisma.oooOmRoom.findMany({
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
    for (let ooo of oooRooms) {
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
      listOfRoom, listOfDepartment,
      arr, dep,
      ident: type != "OOO" ? "OM" : "O-O-O",
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
async function createOooRoom(xType, oooRoom) {
  try {
    return await prisma.oooOmRoom.create({
      data: {
        ...oooRoom,
        xType
      }
    })
  } catch (e) {
    ThrowError(e)
  } finally {
    await PrismaDisconnect()
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
    return await prisma.oooOmRoom.update({
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
    return await prisma.oooOmRoom.delete({
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
