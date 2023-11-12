const { guestTokenClient, userTokenClient } = require("./Helpers/Config/Global/TokenConfig");
const { PrismaDisconnect } = require("./Helpers/DisconnectPrisma");
const { ThrowError } = require("./Helpers/ThrowError");


const generateExpire = (currentDate) => {
    var expiredDate = new Date(currentDate);
    expiredDate.setDate(currentDate.getDate() + 3); //3 days from now
    return expiredDate;
}

const AssigGuestToken = async (token, guestId) => {
    const assignToken = await guestTokenClient.create({
        data: {
            refreshToken: token,
            guestId,
            expired_at: generateExpire(new Date())
        }
    });
    if (assignToken) return assignToken;
    throw Error("unasigned token");
}

const AssignUserToken = async (token, userId) => {
    const assignToken = await userTokenClient.create({
        data: {
            refreshToken: token,
            userId,
            expired_at: generateExpire(new Date())
        }
    });
    if (assignToken) return assignToken;
    throw Error("unasigned token");
}

const checkToken = async (type, entityId) => {
    let token;
    try {
        const tokenClient = type === 'user' ? userTokenClient : guestTokenClient;
        token = await tokenClient.findFirst({ where: { id: entityId } });
        return token;
    } catch (err) {
        ThrowError(err);
    } finally {
        await PrismaDisconnect();
    }
}

const RemoveToken = async (type, entityId) => {
    const tokenExist = await checkToken(type, entityId);
    if (!tokenExist) return deletedToken = 'Token is not existed';
    try {
        const tokenClient = type === 'user' ? userTokenClient : guestTokenClient;
        await tokenClient.delete({ where: { id: entityId } });
    } catch (err) {
        ThrowError(err);
    } finally {
        await PrismaDisconnect();
    }
}