const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../utils/helper")

const getSARoom = async () => {
    try {
        const rooms = await prisma.room.findMany({ select: { id: true, roomImage: true, roomStatus: { select: { longDescription: true } }, roomType: { select: { longDesc: true, bedSetup: true, ArrangmentCode: { select: { id: true } } } } } })
        console.log(rooms)
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const addEditRoom = async (body, act) => {
    try {
        const data = {
            id: body.roomNo,
            description: body.description,
            roomType: {
                connect: {
                    id: body.type,
                    ArrangmentCode: { connect: { id: body.arrangment } }
                }
            }
        }
        if (act === "add") {
            const exist = await prisma.room.findFirst({ where: { id: data.id } })
            if (exist != null) throw Error('Room already exist')
        }
        return await prisma.room.upsert({
            where: { id },
            update: data, create: data
        })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const deleteRoom = async (id) => {
    try{
        return await prisma.room.delete({ where: { id } })
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}

module.exports = { getSARoom, addEditRoom, deleteRoom }