const jwt = require("jsonwebtoken");
const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, generateRandomString, generateExpire } = require("../../utils/helper");

const generateRefreshToken = async (client) => {
  try {
    let generatedToken, tokenExist;
    do {
      generatedToken = generateRandomString(100);
      tokenExist = await client.findUnique({ where: { refreshToken: generatedToken } }); //Check if token is existed in database
    } while (tokenExist != null)
    return generatedToken;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const CheckToken = async (type, accessToken, refreshToken) => {
  try {
    const tokenClient = type === "user" ? prisma.userToken : prisma.guestToken;
    await tokenClient.findFirstOrThrow({ where: { refreshToken } })
    const decoded = jwt.verify(accessToken, process.env.SECRET_CODE);
    const user = await prisma.user.findUnique({
      where: { id: +decoded.sub, deleted: false }, select: {
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
    return user;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const RemoveToken = async (refreshToken) => {
  try {
    console.log('DELETING TOKEN')
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

const deleteAllTokenByRoleId = async (roleId) => {
  try {
    const { users } = await prisma.role.findFirstOrThrow({ where: { id: +roleId }, include: { users: true } })
    for (let user of users) {
      await deleteAllTokenByUserId(user.id)
    }
    return 'Success'
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const deleteAllTokenByUserId = async (userId) => {
  try {
    return await prisma.userToken.deleteMany({ where: { userId } })
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const RefreshToken = async (type, refreshToken, expired_at) => {
  try {
    const tokenClient = type === "user" ? prisma.userToken : prisma.guestToken;
    const token = await tokenClient.findFirstOrThrow({ where: { refreshToken } })
    if (new Date().toISOString() >= token.expire_at) await RemoveToken("user", refreshToken)
    return token
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};


module.exports = { CreateAndAssignToken, CheckToken, RefreshToken, RemoveToken, deleteAllTokenByUserId, deleteAllTokenByRoleId };
