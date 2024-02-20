const { prisma } = require("../../../prisma/seeder/config")
const bcrypt = require("bcrypt");
const { ThrowError, PrismaDisconnect, existingAccess } = require("../../utils/helper")

const getData = async (query) => {
    let { role } = query, sendedData = { listRole: [], listUser }
    try {
        const roles = await prisma.role.findMany({ select: { id: true, name: true, access: true } })
        for (let role of roles) {
            sendedData.listRole = {
                id: role.id,
                name: role.name,
                superAdmin: {
                    reader: role.access['readSuperAdmin'] != undefined ? role.access['readSuperAdmin'] : false,
                    editor: role.access['createSuperAdmin'] != undefined ? role.access['createSuperAdmin'] : false
                },
                admin: {
                    reader: role.access['readAdmin'] != undefined ? role.access['readAdmin'] : false,
                    editor: role.access['createAdmin'] != undefined ? role.access['createAdmin'] : false
                },
                roomBoy: {
                    reader: role.access['readMaid'] != undefined ? role.access['readMaid'] : false,
                    editor: role.access['createMaid'] != undefined ? role.access['createMaid'] : false
                },
                supervisor: {
                    reader: role.access['readSupervisor'] != undefined ? role.access['readSupervisor'] : false,
                    editor: role.access['createSupervisor'] != undefined ? role.access['createSupervisor'] : false
                },
            }
        }
        const users = await prisma.user.findMany({ where: { ...(role != "ALL" && { roleId: role }) }, select: { id: true, name: true, email: true, role: { select: { name: true } }, roomMaids: true } })
        sendedData.listUser = users.map(user => ({
            id: user.id,
            email: user.email,
            role: user.role.name,
            isRoomBoy: user.roomMaids.length <= 0 ? "✖️" : "✔️"
        }))
        return sendedData
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const postAddEditUser = async (body, act) => {
    let { id, name, phone, birthday, nik, gender, username, password } = body, message = "Edit User Success"
    try {
        if (!(act != "add")) {
            const exist = await prisma.user.findFirst({ where: { id } })
            if (exist != null) throw Error('User already exist')
            message = "Create User Success"
        }
        const salt = await bcrypt.genSalt();
        password = await bcrypt.hash(password, salt);
        const user = await prisma.user.upsert({
            where: { id },
            update: { name, phone, birthday, nik, gender, username, password },
            create: { ...body }
        })
        return { message, data: user }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const postAddEditRole = async (body, act) => {
    let { id, name } = body, message = `Edit Role ${name} Success`
    try {
        if (!(act != "add")) {
            const exist = await prisma.role.findFirst({ where: { id } })
            if (exist != null) throw Error('Role already exist')
            message = `Create Role ${name} Success`
        }
        const role = await prisma.role.upsert({
            where: { id },
            update: { ...body },
            create: { ...body }
        })
        return { message, data: role }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const addNewRoomBoy = async (body) => {
    const { userId, shift, aliases } = body
    try {
        const [userExist, shiftExist] = await prisma.$transaction([
            prisma.roomMaid.findFirst({ where: { userId } }),
            prisma.shift.findFirstOrThrow({ where: { id: shift } })
        ])
        if (!exist) throw Error('User already assign as Maid')
        return await prisma.roomMaid.create({
            data: { id: userExist.id, shiftId: shiftExist.id, aliases }
        })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const editRoomBoy = async (maidId, body) => {
    const {shift, aliases } = body
    try {
        const [userExist, shiftExist] = await prisma.$transaction([
            prisma.roomMaid.findFirstOrThrow({ where: { id: maidId } }),
            prisma.shift.findFirstOrThrow({ where: { id: body.shift } })
        ])
        return await prisma.roomMaid.update({ where: { id: maidId }, data: { shiftId: shift, aliases} })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const deleteRole = async (id) => {
    try{
        const exist = await prisma.role.findFirstOrThrow({ where: { id }, select: { users: true } })
        for(let user of exist.users){
            await prisma.user.update({ where: { id: user.id }, data: { roleId: 1} }) //Change to REMOVED
        }
        return await prisma.role.delete({ where: { id } })
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}

module.exports = { getData, postAddEditRole, postAddEditUser, addNewRoomBoy, editRoomBoy, deleteRole }