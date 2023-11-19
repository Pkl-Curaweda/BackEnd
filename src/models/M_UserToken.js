const jwt = require("jsonwebtoken");
const { guestTokenClient, userTokenClient } = require("./Helpers/Config/Global/TokenConfig");
const { PrismaDisconnect } = require("./Helpers/DisconnectPrisma");
const { ThrowError } = require("./Helpers/ThrowError");

const generateExpire = (currentDate) => {
  var expiredDate = new Date(currentDate);
  expiredDate.setDate(currentDate.getDate() + 3); //3 days from now
  return expiredDate;
};

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

const generateRefreshToken = async (client) => {
  try {
    let generatedToken, tokenExist;
    do {
      generatedToken = generateRandomString(100);
      tokenExist = await client.findUnique({ where: { refreshToken: generatedToken } });
    } while (tokenExist)
    return generatedToken;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const CreateAndAssignToken = async (type, data) => {
  try {
    //?CREATE THE TOKEN
    const tokenClient = type === "user" ? userTokenClient : guestTokenClient;
    const generatedRefreshToken = await generateRefreshToken(tokenClient);
    //?ASSIGN THE TOKEN
    const entity = type === "user" ? 'userId' : 'guestId';
    const assignToken = await tokenClient.create({
      data: {
        refreshToken: generatedRefreshToken,
        [entity]: data.id,
        expired_at: generateExpire(new Date())
      }
    })
    if (!assignToken) throw Error('Unsuccesfull Token Assign');
    return generatedRefreshToken
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
}

const checkToken = async (type, refreshToken) => {
  let token;
  try {
    const tokenClient = type === "user" ? userTokenClient : guestTokenClient;
    token = await tokenClient.findUniqueOrThrow({ where: { refreshToken } });
    if (!token) throw Error('Invalid refresh token')
    if (Date.now() > refreshToken.expired_at.getTime()) throw Error('Refresh token expired')
    return token;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const RefreshToken = async (type, refreshToken, expired_at) => {
  try {
    const tokenClient = type === "user" ? userTokenClient : guestTokenClient;
    const deletedToken = await tokenClient.delete({ where: { refreshToken } });
    const generatedRefreshToken = await generateRefreshToken(tokenClient)
    const newRefreshToken = await tokenClient.create({
      data: {
        userId: deletedToken.userId,
        refreshToken: generatedRefreshToken,
        expired_at
      }
    })
    return newRefreshToken;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const RemoveToken = async (type, refreshToken) => {
  try {
    const tokenClient = type === "user" ? userTokenClient : guestTokenClient;
    const deletedToken = await tokenClient.delete({ where: { refreshToken } });
    return deletedToken;
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect();
  }
}

module.exports = { CreateAndAssignToken, checkToken, RefreshToken, RemoveToken };
