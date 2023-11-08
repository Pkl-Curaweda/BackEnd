const { PrismaClient } = require("@prisma/client");
const guestTokenClient = new PrismaClient().guestToken;
const userTokenClient = new PrismaClient().userToken;

const generateExpire = (currentDate) => {
    var expiredDate = new Date(currentDate);
    expiredDate.setDate(currentDate.getDate() + 3); //3 days from now
    return expiredDate;
}

const AssigGuestToken = async (id, token) => {
    const assignToken = await guestTokenClient.create({
        data: { id, token, expired_at: generateExpire(new Date()) }
    });
    if(assignToken) return assignToken;
    throw Error("unasigned token");
}

const AssignUserToken = async (id, token) => {
    const assignToken = await userTokenClient.create({
        data: { id, token, expired_at: generateExpire(new Date()) }
    });
    if(assignToken) return assignToken;
    throw Error("unasigned token");
}

const RemoveToken = async () => {

}