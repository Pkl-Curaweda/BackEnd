const bcrypt = require("bcrypt");
const { ThrowError } = require("./Helpers/ThrowError");
const { PrismaDisconnect } = require("./Helpers/DisconnectPrisma");
const { userClient } = require("./Helpers/Config/Front Office/UserConfig");
const { RemoveToken, CreateAndAssignToken } = require("./M_UserToken");

const UserLogin = async (email, password) => {
  try {
    const user = await userClient.findUniqueOrThrow({ where: { email } });
    if (!user) throw Error("User Not Found");
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
    await PrismaDisconnect();
  }
}

const GetAllUsers = async () => {
  try {
    const user = await userClient.findMany({
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
