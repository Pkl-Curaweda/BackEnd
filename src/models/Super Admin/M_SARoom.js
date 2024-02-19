const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../utils/helper")

const getSARoom = async () => {
    try {
        let [rooms, roomTypes, arrangment] = await prisma.$transaction([
            prisma.room.findMany({ select: { id: true, roomImage: true, roomStatus: { select: { longDescription: true } }, roomType: { select: { id: true, bedSetup: true, ArrangmentCode: { select: { id: true } } } } } }),
            prisma.roomType.findMany({ select: { id: true }, orderBy: { id: 'asc' } }),
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
            id: body.shortDesc.toUpperCase(),
            longDesc: body.longDesc.toUpperCase(),
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

        if (body.generateArr && act === "add") {
            console.log('Sampe sini?')
            const RbRo = [`${data.id}-RB`, `${data.id}-RO`]
            const priceRbRo = [body.priceRB, body.priceRO]
            const arrangmentData = []
            for (let index = 0; index <= (RbRo.length - 1); index++)
                arrangmentData.push({
                    id: RbRo[index],
                    rate: priceRbRo[index],
                    matchTypeId: createdtype.id
                })
            await addEditArrangment(arrangmentData, "add")
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

const addEditArrangment = async (body, act) => {
    let messageAction = "Edited"
    try {
        const listArr = []
        for (let arrangment of body) {
            let alreadyExist = false
            if (act === "add") {
                messageAction = "Created"
                alreadyExist = await prisma.arrangmentCode.findFirst({ where: { id: arrangment.id } })
            }
            if (!alreadyExist) {
                const arr = await prisma.arrangmentCode.upsert({
                    where: { id: arrangment.id },
                    create: arrangment, update: arrangment
                })
                listArr.push(arr)
            }
        }
        return { message: `${listArr.length} Arrangment ${messageAction} Successfully`, data: listArr }
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
                prismaClient = prisma.room
                break;
            case "room-type":
                message = `Room Type ${id} Deleted Successfully`
                prismaClient = prisma.roomType
                break;
            case "arr":
                message = `Arrangment ${id} Deleted Successfully`
                prismaClient = prisma.arrangmentCode
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

const deleteRoomType = async (id) => {
    try {
        const relatedData = await prisma.roomType.findFirstOrThrow({ where: { id }, select: { Room: true, ArrangmentCode: true } })
        const { Room, ArrangmentCode } = relatedData
        for (let room of Room) {
            await prisma.room.update({ where: { id: room.id }, data: { roomType: { connect: { id: "REMOVED" } } } })
        }
        for (let arr of ArrangmentCode) {
            await prisma.arrangmentCode.update({ where: { id: arr.id }, data: { matchType: { connect: { id: "REMOVED" } } } })
        }
        await prisma.roomType.delete({ where: { id } })
        return { message: `Room Type ${id} successfully deleted`, data: { changesIn: relatedData } }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const deleteArrangment = async (id) => {
    try {
        const relatedData = await prisma.arrangmentCode.findFirstOrThrow({ where: { id }, select: { ResvRoom: true } })
        const { ResvRoom } = relatedData
        for (let resvRoom of ResvRoom) {
            await prisma.resvRoom.update({ where: { id: resvRoom.id }, data: { arrangmentCodeId: "REMOVED" } })
        }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const deleteRoom = async (id) => {
    try {
        const relatedData = await prisma.room.findFirstOrThrow({ where: { id }, select: { order: true, resvRooms: true, cleanRooms: true, dirtyRooms: true, lostFounds: true, MaidTask: true, OooOmRoom: true, Invoice: true, User: true } })
        const updatedData = { ...relatedData }
        for (let invoice of updatedData.Invoice) {
            await prisma.invoice.update({ where: { id: invoice.id }, data: { roomId: 0 } })
        }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getSARoom, addEditRoom, deleteSARoom, addEditRoomType, addEditArrangment, deleteRoomType, deleteArrangment }