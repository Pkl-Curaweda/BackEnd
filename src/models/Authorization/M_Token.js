const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, generateRandomString, generateExpire } = require("../../utils/helper");

const generateRefreshToken = async (client) => {
  try {
    let generatedToken, tokenExist;
    do {
      generatedToken = generateRandomString(100);
      tokenExist = await client.findUnique({ where: { refreshToken: generatedToken } }); //Check if token is existed in database
    } while (tokenExist)
    return generatedToken;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const CheckToken = async (type, refreshToken) => {
  let token;
  try {
    const tokenClient = type === "user" ? prisma.userToken : prisma.guestToken;
    token = await tokenClient.findUniqueOrThrow({ where: { refreshToken } });
    console.log(token)
    if (!token) throw Error('Invalid refresh token')
    if (Date.now() > refreshToken.expired_at.getTime()) throw Error('Refresh token expired')
    return token;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const RemoveToken = async (type, refreshToken) => {
  try {
    const [exist, deletedToken] = await prisma.$transaction([
      prisma.userToken.findFirstOrThrow({ where: { refreshToken } }),
      prisma.userToken.delete({ where: { refreshToken } })
    ])
    return deletedToken;
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect();
  }
}

const CreateAndAssignToken = async (type, data) => {
  try {
    //?CREATE THE TOKEN
    const tokenClient = type === "user" ? prisma.userToken : prisma.guestToken;
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

const RefreshToken = async (type, refreshToken, expired_at) => {
  try {
    const tokenClient = type === "user" ? prisma.userToken : prisma.guestToken;
    await tokenClient.findFirstOrThrow({ where: { refreshToken } })
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


module.exports = { CreateAndAssignToken, CheckToken, RefreshToken, RemoveToken };
