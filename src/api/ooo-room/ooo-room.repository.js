  import prisma from '#db/db.js'

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
  const {
    page,
    show,
    sort,
    order,
    from,
    until
  } = option

  const where = {
    AND: [
      {
        from: {
          gte: from,
        },
      },
      {
        until: {
          lte: until
        }
      }
    ]
  }

  try {
    const [total, oooRooms] = await prisma.$transaction([
      prisma.oooRoom.count({ where }),
      prisma.oooRoom.findMany({
        take: show,
        skip: (page - 1) * show,
        orderBy: {
          [sort]: order,
        },
        select,
        where
      })
    ])

    return { oooRooms, total }

  } catch(e) {
    throw new Error
  }
}


/**
 * @param {import('@prisma/client').oooRoom} oooRoom
 * @throws {Error}
 * @return {Promise<import('@prisma/client').oooRoom>}
 */
async function createOooRoom(oooRoom) {
  console.log(oooRoom)
  try {
    return await prisma.oooRoom.create({
      data: oooRoom,
    })
  } catch (e){
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

export default {
  all,
  createOooRoom,
  update,
  remove
}
