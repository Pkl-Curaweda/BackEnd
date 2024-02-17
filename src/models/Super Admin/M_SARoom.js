const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../utils/helper")

const getSARoom = async () => {
    try {
        let [rooms, roomTypes, arrangment] = await prisma.$transaction([
            prisma.room.findMany({ select: { id: true, roomImage: true, roomStatus: { select: { longDescription: true } }, roomType: { select: { id: true, bedSetup: true, ArrangmentCode: { select: { id: true } } } } } }),
            prisma.roomType.findMany({ select: { id: true }, orderBy: { id: 'asc'} }),
            prisma.arrangmentCode.findMany({ select: { id: true }, orderBy: { matchTypeId: 'asc' } })
        ])
        rooms = rooms.map(room => ({
            roomNo: room.id,
            roomType: room.roomType.id,
            arrangment: room.roomType.ArrangmentCode,
            roomStatus: room.roomStatus.longDescription,
            bedSetup: room.roomType.bedSetup,
            image: room.roomImage
        }))
        return { rooms, roomTypes, arrangment }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const addEditRoom = async (body, act) => {
    try {
        const data = {
            id: +body.roomNo,
            description: body.description,
            roomType: { connect: { id: body.type } },
            roomImage: body.image,
            floor: +body.floor,
            roomStatus: {
                connect: { id: 1 }
            }
        }
        let message = `Room ${data.id} Edited Succesfully`
        if (act === "add") {
            message = `Room ${data.id} Created Succesfully`
            const exist = await prisma.room.findFirst({ where: { id: data.id } })
            if (exist != null) throw Error('Room already exist')
        }
        const room = await prisma.room.upsert({
            where: { id: +body.roomNo },
            update: { ...data }, create: { ...data }
        })
        return { message, data: room }
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
        let message = `Room Type ${data.id} Edited Succesfully`
        if (act === "add") {
            message = `Room Type ${data.id} Created Succesfully`
            const exist = await prisma.roomType.findFirst({ where: { id: data.id } })
            if (exist != null) throw Error('Type already exist')
        }
        const createdtype = await prisma.roomType.upsert({
            where: { id: data.id },
            update: data, create: data
        })

        if (body.genearateArr && act === "add") {
            const RbRo = [`${data.id}-RB`, `${data.id}-RO`]
            const priceRbRo = [body.priceRB, body.priceRO]
            const arrangmentData = []
            for (i = 0; i >= RbRo.length - 1; i++) {
                arrangmentData.push({
                    id: RbRo[i],
                    rate: priceRbRo[i],
                    matchTypeId: createdtype.id
                })
            }
            await addEditArrangment(arrangmentData)
        }
        return {
            message, data: createdtype
        } 
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const addEditArrangment = async (body) => {
    try {
        const listArr = []
        for (let arrangment of body) {
            const arr = await prisma.arrangmentCode.upsert({
                where: { id: arrangment.id },
                create: arrangment, update: arrangment
            })
            listArr.push(arr)
        }
        return { message: "Edit / Add Arrangment Success", data: listArr }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}


const deleteSARoom = async (id, ident) => {
    let prismaClient, message
    try {
        switch (ident) {
            case "room":
                message = `Room ${id} Deleted Successfully`
                prisma.room
                break;
            case "type":
                message = `Room Type ${id} Deleted Successfully`
                prisma.roomType
                break;
            case "arr":
                message = `Arrangment ${id} Deleted Successfully`
                prisma.arrangmentCode
                break;
            default:
                throw Error('Cannot be deleted')
        }
        const data = await prismaClient.delete({ where: { id } })
        return { message, data }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getSARoom, addEditRoom, deleteSARoom, addEditRoomType, addEditArrangment }