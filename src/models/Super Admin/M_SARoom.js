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

const addEditRoomType = async (body, act) => {
    try {
        const data = {
            id: body.shortDesc,
            longDesc: body.longDesc,
            bedSetup: body.bedSetup
        }
        if (act === "add") {
            const exist = await prisma.room.findFirst({ where: { id: data.id } })
            if (exist != null) throw Error('Type already exist')
        }
    
        const createdtype = await prisma.roomType.upsert({
            where: { id },
            update: { ArrangmentCode: { conne } }, create: data
        })

        if (body.genearateArr) {
            const RbRo = [`${data.id}-RB`, `${data.id}-RO`]
            const priceRbRo = [body.priceRB, body.priceRO]
            for (i = 0; i >= RbRo.length - 1; i++) {
                await prisma.arrangmentCode.upsert({
                    where: { id: RbRo[i] },
                    create: {
                        id: RbRo[i],
                        rate: priceRbRo[i],
                        matchTypeId: createdtype.id
                    }
                })
            }
        }

    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const addEditArrangment = async (body, act) => {
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
    try {
        return await prisma.room.delete({ where: { id } })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const deleteRoomType = async (id) => {
    try {
        return await prisma.roomType.delete({ where: { id } })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const deleteArrangment = async (id) => {
    try {
        return await prisma.arrangmentCode.delete({ where: { id } })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getSARoom, addEditRoom, deleteRoom, deleteRoomType, deleteArrangment }