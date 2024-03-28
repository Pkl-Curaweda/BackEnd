const bcrypt = require('bcrypt');
const fs = require('fs')
const qr = require("qrcode");
const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect } = require("../../utils/helper");
const { RemoveToken, CreateAndAssignToken, deleteTokenByUserId, deleteAllTokenByUserId } = require("./M_Token");
const { encrypt } = require('../../utils/encryption');
const { th } = require('@faker-js/faker');
const { threadId } = require('worker_threads');

const UserLogin = async (email, password) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email, deleted: false }, select: {
        id: true,
        name: true,
        username: true,
        email: true,
        picture: true,
        password: true,
        canLogin: true,
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
    if (!user) throw Error('Unregistered Email. Please use registered Email')
    if (!user.canLogin) throw Error('Your account need to be activated, please tell our staff')
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
    const removeToken = await RemoveToken(RefreshToken);
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

const forceActivateUserByEmail = async (body) => {
  try {
    const exist = await prisma.user.findFirstOrThrow({ where: { email: body.email, deleted: false }, select: { id: true } })
    delete body.email
    return await prisma.user.update({ where: { id: exist.id }, data: { canLogin: true, ...body } })
  } catch (err) {
    ThrowError(err)
  } finally { await PrismaDisconnect() }
}

const activateDeactivateRoomEmail = async (resvRoomId, act) => {
  try {
    const resvRoom = await prisma.resvRoom.findFirstOrThrow({ where: { id: +resvRoomId }, select: { id: true, roomId: true, reservation: { select: { reserver: { select: { guest: true } } } } } })
    const emailRoomExist = await prisma.user.findFirst({ where: { email: `room${resvRoom.roomId}${process.env.EMAIL}`, role: { name: "Room" } }, select: { id: true, canLogin: true } })
    const { guest } = resvRoom.reservation.reserver
    if (act != "deactivate") {
      return await prisma.user.update({
        where: { id: emailRoomExist.id },
        data: { canLogin: true, guestId: guest.id, resvRoomId: resvRoom.id, name: guest.name, phone: guest.contact }
      })
    } else {
      console.log('Token deleted')
      const token = await prisma.userToken.findFirst({ where: { id: emailRoomExist.id } })
      if (token != null) await prisma.userToken.delete({ where: { id: emailRoomExist.id } }) // Delete the token, so it cannot be log again
      return await prisma.user.update({
        where: { id: emailRoomExist.id },
        data: { canLogin: false, name: "Room", phone: null, birthday: null, gender: null }
      })
    }
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const changePassword = async (email, newPassword) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email, deleted: false }, select: { id: true, password: true}
    });
    if (!user) throw Error('Unregistered Email. Please use registered Email')
    if( await bcrypt.compare(newPassword, user.password)) throw Error('Password is the same as the previous')

    const salt = await bcrypt.genSalt()
    newPassword = await bcrypt.hash(newPassword, salt)
    return await prisma.user.update({ where: { id: user.id }, data: { password: newPassword } })
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const createQRCode = async (email, password) => {
  try {
    const storedData = { email, password }
    const exist = await prisma.user.findFirstOrThrow({ where: { email } })
    const match = await bcrypt.compare(password, exist.password)
    if (!match) throw Error('Wrong Password')
    const path = `${process.env.QR_PATH}/QR-${email}.png`
    if (!fs.existsSync(path)) {
      const stringfyData = JSON.stringify(storedData);
      const encryptedData = encrypt(stringfyData);
      const storedQR = encryptedData;
      qr.toFile(path, storedQR, (err) => {
        if (err) console.log(err);
      });
    }
    return encrypt(path)
  } catch (err) {
    ThrowError(err)
  } finally { await PrismaDisconnect() }
}

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


module.exports = { UserLogin, UserLogout, GetAllUsers, changePassword, all, get, create, update, remove, forbiddenToLogin, activateDeactivateRoomEmail, forceActivateUserByEmail, createQRCode };
