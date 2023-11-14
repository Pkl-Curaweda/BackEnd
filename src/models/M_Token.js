const jwt = require("jsonwebtoken");
const {
  guestTokenClient,
  userTokenClient,
} = require("./Helpers/Config/Global/TokenConfig");
const { PrismaDisconnect } = require("./Helpers/DisconnectPrisma");
const { ThrowError } = require("./Helpers/ThrowError");
// const { da } = require("@faker-js/faker");

const generateExpire = (currentDate) => {
  var expiredDate = new Date(currentDate);
  expiredDate.setDate(currentDate.getDate() + 3); //3 days from now
  return expiredDate;
};

const createToken = async (storedData, client) => {
  let existedToken;
  try {
    const generatedToken = jwt.sign({ storedData }, process.env.SECRET_CODE, {
      expiresIn: process.env.TOKEN_AGE || 3 * 24 * 60 * 60,
    });
    existedToken = await CheckExistedToken(generatedToken, client);
    if (existedToken) await createToken(storedData, client);
    return generatedToken;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const CheckExistedToken = async (token, client) => {
  try {
    const existedToken = await client.findUnique({
      where: {
        refreshToken: token,
      },
    });
    return existedToken;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect;
  }
};

const CreateAndAssignToken = async (type, data) => {
  try {
    console.log(data);
    //?CREATE THE TOKEN
    const client = type === "user" ? userTokenClient : guestTokenClient;
    const generatedToken = await createToken(
      data.email || data.username,
      client
    );

    //?ASSIGN THE TOKEN
    const entity = type === "user" ? "userId" : "guestId";
    const assignToken = await client.create({
      data: {
        refreshToken: generatedToken,
        [entity]: data.id,
        expired_at: generateExpire(new Date()),
      },
    });
    if (assignToken) return assignToken;
    throw Error("unasigned token");
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const checkToken = async (type, entityId) => {
  let token;
  try {
    const tokenClient = type === "user" ? userTokenClient : guestTokenClient;
    token = await tokenClient.findFirst({ where: { id: entityId } });
    return token;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const RemoveToken = async (type, entityId) => {
  const tokenExist = await checkToken(type, entityId);
  if (!tokenExist) return (deletedToken = "Token is not existed");
  try {
    const tokenClient = type === "user" ? userTokenClient : guestTokenClient;
    await tokenClient.delete({ where: { id: entityId } });
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

module.exports = { CreateAndAssignToken, RemoveToken };
