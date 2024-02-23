const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../utils/helper")

const getSARoom = async () => {
    try {
        let [rooms, roomTypes, arrangment] = await prisma.$transaction([
            prisma.room.findMany({ where: { deleted: false, NOT: [{ id: 0 }] }, select: { id: true, description: true, floor: true, roomImage: true, roomStatus: { select: { longDescription: true } }, roomType: { select: { id: true, bedSetup: true, ArrangmentCode: { select: { id: true } } } } } }),
            prisma.roomType.findMany({ where: { deleted: false, NOT: [{ id: 'REMOVED' }] }, select: { id: true }, orderBy: { id: 'asc' } }),
            prisma.arrangmentCode.findMany({ where: { deleted: false, NOT: [{ id: 'REMOVED' }] }, select: { id: true }, orderBy: { matchTypeId: 'asc' } })
        ])
        rooms = rooms.map(room => ({
            roomNo: room.id,
            roomType: room.roomType.id,
            arrangment: room.roomType.ArrangmentCode,
            roomStatus: room.roomStatus.longDescription,
            bedSetup: room.roomType.bedSetup,
            description: room.description,
            floor: room.floor,
            image: room.roomImage
        }))
        return { rooms, roomTypes, arrangment }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const getEditRoomTypeHelper = async (id) => {
    let detail = {}
    try {
        listArr = ["RB", "RO"]
        const roomType = await prisma.roomType.findFirstOrThrow({ where: { id, deleted: false }, select: { id: true, longDesc: true, bedSetup: true, ArrangmentCode: { select: { id: true, rate: true } } } })
        const {standardTime} = await prisma.taskType.findFirstOrThrow({ where: { id:`FCLN-${roomType.id}` }, select: { standardTime: true } })
        detail.longDescription = roomType.longDesc
        detail.shortDesc = roomType.id
        detail.bedSetup = roomType.bedSetup
        detail.standardTime = standardTime
        for (let arr of roomType.ArrangmentCode) detail[`${arr.id.split('-')[1]}Price`] = arr.rate
        return detail
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const getEditArrangmentHelper = async (id) => {
    try {
        return await prisma.arrangmentCode.findFirstOrThrow({ where: { id, deleted: false }, select: { id: true, rate: true, matchTypeId: true } })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const getAddArrangmentHelper = async (id) => {
    try {
        const exist = await prisma.roomType.findFirstOrThrow({ where: { id, deleted: false } })
        return {
            rbName: `${exist.id}-RB`,
            roName: `${exist.id}-RO`
        }
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
            if (exist != null && exist.deleted != false)
                if (exist != null) throw Error('Type already exist')
            await prisma.taskType.create({ data: { standardTime: body.standardTime, id: `FCLN-${data.id}`, activity: `Full Clean ${data.longDesc} Room`, UoM: "minute", departmentId: 2 } })
        } else if (act != "add" && body.standardTime != undefined) {
            await prisma.taskType.update({ where: { id: `FCLN-${data.id}` }, data: { standardTime: body.standardTime } })
        }
        const createdtype = await prisma.roomType.upsert({
            where: { id: data.id },
            update: data, create: data
        })

        if (body.generateArr && act === "add") {
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
            await prisma.roomType.findFirstOrThrow({ where: { id: arrangment.matchTypeId } })
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


// const deleteSARoom = async (id, ident) => {
//     let prismaClient, message
//     try {
//         switch (ident) {
//             case "room":
//                 message = `Room ${id} Deleted Successfully`
//                 prismaClient = prisma.room
//                 break;
//             case "room-type":
//                 message = `Room Type ${id} Deleted Successfully`
//                 prismaClient = prisma.roomType
//                 break;
//             case "arr":
//                 message = `Arrangment ${id} Deleted Successfully`
//                 prismaClient = prisma.arrangmentCode
//                 break;
//             default:
//                 throw Error('Cannot be deleted')
//         }
//         const data = await prismaClient.delete({ where: { id } })
//         return { message, data }
//     } catch (err) {
//         ThrowError(err)
//     } finally {
//         await PrismaDisconnect()
//     }
// }

const deleteRoomType = async (id) => {
    try {
        const [exist, deletedData] = await prisma.$transaction([
            prisma.roomType.findFirstOrThrow({ where: { id } }),
            prisma.roomType.update({ where: { id }, data: { deleted: true } })
        ])
        return { message: `Room Type ${id} successfully deleted`, data: deletedData }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const deleteArrangment = async (id) => {
    try {
        const [exist, deletedData] = await prisma.$transaction([
            prisma.arrangmentCode.findFirstOrThrow({ where: { id } }),
            prisma.arrangmentCode.update({ where: { id }, data: { deleted: true } })
        ])
        return { message: `Arrangment ${id} successfully deleted`, data: deletedData }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const deleteRoom = async (id) => {
    try {
        const [exist, deletedData] = await prisma.$transaction([
            prisma.room.findFirstOrThrow({ where: { id } }),
            prisma.room.update({ where: { id }, data: { deleted: true } })
        ])
        return { message: `Room ${id} successfully deleted`, data: deletedData }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getSARoom, addEditRoom, addEditRoomType, addEditArrangment, deleteRoomType, deleteArrangment, getEditArrangmentHelper, getAddArrangmentHelper, getEditRoomTypeHelper, deleteRoom }