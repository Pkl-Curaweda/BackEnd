const bcrypt = require('bcrypt');
const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect } = require("../../utils/helper");
const { RemoveToken, CreateAndAssignToken } = require("./M_Token");

const UserLogin = async (email, password) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email }, select: {
        id: true,
        name: true,
        username: true,
        email: true,
        picture: true,
        password: true,
        role: {
          select: {
            name: true
          }
        }
      }
    });
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) throw Error("Wrong Password");
    const createdToken = await CreateAndAssignToken("user", user);
    return {
      user, createdToken
    }
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const UserLogout = async (RefreshToken) => {
  try {
    const removeToken = await RemoveToken("user", RefreshToken);
    if (!removeToken) throw Error('Unsuccess Logout')
    return removeToken
  } catch (err) {
    ThrowError(err)
  } finally {
  }
}

const GetAllUsers = async () => {
  try {
    const user = await prisma.user.findMany({
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

module.exports = { UserLogin, UserLogout, GetAllUsers };
