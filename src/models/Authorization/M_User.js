const bcrypt = require('bcrypt');
const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect } = require("../../utils/helper");
const { RemoveToken, CreateAndAssignToken, deleteTokenByUserId, deleteAllTokenByUserId } = require("./M_Token");

const UserLogin = async (email, password) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email, deleted: false }, select: {
        id: true,
        name: true,
        username: true,
        email: true,
        picture: true,
        password: true,
        guest: {
          select: {
            name: true,
          }
        },
        role: {
          select: {
            name: true,
            defaultPath: true
          }
        }
      }
    });
    console.log(user)
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) throw Error("Wrong Password");
    const createdToken = await CreateAndAssignToken("user", user);
    const path = user.role.defaultPath
    return { user, createdToken, path }
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const UserLogout = async (RefreshToken) => {
  try {
    const removeToken = await RemoveToken("user", RefreshToken);
    return removeToken
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const GetAllUsers = async () => {
  try {
    const user = await prisma.user.findMany({
      where: { deleted: false },
      select: {
        username: true,
        email: true,
        role: {
          select: {
            name: true
          }
        }
      }
    });
    return user;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const forbiddenToLogin = async (userId) => {
  try {
    const userExist = await prisma.user.findFirstOrThrow({ where: { id: +userId } })
    await deleteAllTokenByUserId(userExist.id)
    return await prisma.user.update({ where: { id: +userId }, data: { canLogin: false } })
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const activateDeactivateRoomEmail = async (resvRoomId, act) => {
  try {
    const resvRoom = await prisma.resvRoom.findFirstOrThrow({ where: { id: +resvRoomId }, select: { roomId: true, reservation: { select: { reserver: { select: { guestId: true } } } } } })
    const emailRoomExist = await prisma.user.findFirst({ where: { email: `room${resvRoom.roomId}`, role: { name: "Room" } }, select: { id: true, canLogin: true } })
    if (act != "deactivate") {
      return await prisma.user.update({
        where: { id: emailRoomExist.id },
        data: { canLogin: true, guestId: resvRoom.reservation.reserver.guestId }
      })
    } else {
      return await prisma.user.update({
        where: { id: emailRoomExist.id },
        data: { canLogin: false, guestId: null }
      })
    }
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

/**
 * @typedef {object} GetAllUserOption
 * @property {number} page
 * @property {number} show
 * @property {string} query
 * @property {string} sort
 * @property {'asc'|'desc'} order
 * @property {Date} from
 * @property {Date} to
 * @property {number} roleId
 */

/**
 * @typedef {object} GetAllUserResult
 * @property {number} total
 * @property {import('@prisma/client').User[]} users
 */

const select = {
  id: true,
  name: true,
  email: true,
  username: true,
  birthday: true,
  nik: true,
  picture: true,
  gender: true,
  phone: true,
  role: {
    select: {
      name: true,
    }
  }
}

/**
 * @param {GetAllUserOption} option
 * @throws {Error}
 * @return {Promise<GetAllUserResult>}
 */
async function all(option) {
  const { page, show, query, sort, order, from, to, roleId } = option

  const where = {
    AND: [
      {
        OR: [
          { username: { contains: query } },
          { email: { contains: query } },
          { name: { contains: query } },
        ]
      },
      {
        birthday: {
          gte: from,
          lte: to,
        },
      }, { roleId }
    ],
  }

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      take: show,
      skip: (page - 1) * show,
      where,
      orderBy: {
        [sort]: order,
      },
      select
    })
  ])

  return { users, total }
}

/**
 * @param {string} id
 * @throws {Error}
 * @return {Promise<import('@prisma/client').User>}
 */
async function get(id) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id: parseInt(id), deleted: false
    },
    select
  })
}

/**
 * @param {import('@prisma/client').User} user
 * @throws {Error}
 * @return {Promise<import('@prisma/client').User>}
 */
async function create(user) {
  return await prisma.user.create({
    data: user,
    select
  })
}

/**
 * @param {string} id
 * @param {import('@prisma/client').User} user
 * @throws {Error}
 * @return {Promise<import('@prisma/client').User>}
 */
async function update(id, user) {
  return await prisma.user.update({
    where: {
      id: parseInt(id)
    },
    data: user,
    select
  })
}

/**
 * @param {string} id
 * @throws {Error}
 * @return {Promise<import('@prisma/client').User>}
 */
async function remove(id) {
  return await prisma.user.delete({
    where: {
      id: parseInt(id)
    },
    select
  })
}


module.exports = { UserLogin, UserLogout, GetAllUsers, all, get, create, update, remove, forbiddenToLogin, activateDeactivateRoomEmail };
