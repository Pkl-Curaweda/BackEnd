const { randomInt } = require("crypto")
const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../utils/helper")

const assignRoomMaid = async (resvRoomId) => {
    try{
        const users = await prisma.user.findMany({
            where: { role: { id: 3 } },
            select: { id: true }
        })

        const user = users[randomInt(users.length)]
        const roomMaid = prisma.roomMaid.create({
            data: {
                userId: user.id,
                roomStatusId: 1,
                departmentId: 1,
                resvRoomId,
                no: "No?",
                done: false,
                from: new Date(),
                to: new Date(),
                note: "Dont leave the stain in the bed sheet"
            }
        })
        return roomMaid
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}

module.exports = { assignRoomMaid }