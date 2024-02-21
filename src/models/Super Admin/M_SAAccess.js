const { prisma } = require("../../../prisma/seeder/config")
const bcrypt = require("bcrypt");
const M_User = require('../Authorization/M_User')
const { ThrowError, PrismaDisconnect, existingAccess, convertBooleanToEmoji } = require("../../utils/helper");

const getData = async (query) => {
    let { roleId } = query, sendedData = { listRole: [], listUser: undefined }
    try {
        const roles = await prisma.role.findMany({ select: { id: true, name: true, access: true } })
        for (let role of roles) {
            sendedData.listRole.push({
                id: role.id,
                name: role.name,
                superAdmin: {
                    reader: role.access['showSuperAdmin'] != undefined ? convertBooleanToEmoji(role.access['showSuperAdmin']) : "✖️",
                    editor: role.access['createSuperAdmin'] != undefined ? convertBooleanToEmoji(role.access['createSuperAdmin']) : "✖️"
                },
                admin: {
                    reader: role.access['showAdmin'] != undefined ? convertBooleanToEmoji(role.access['showAdmin']) : "✖️",
                    editor: role.access['createAdmin'] != undefined ? convertBooleanToEmoji(role.access['createAdmin']) : "✖️"
                },
                roomBoy: {
                    reader: role.access['showMaid'] != undefined ? convertBooleanToEmoji(role.access['showMaid']) : "✖️",
                    editor: role.access['createMaid'] != undefined ? convertBooleanToEmoji(role.access['createMaid']) : "✖️"
                },
                supervisor: {
                    reader: role.access['showSupervisor'] != undefined ? convertBooleanToEmoji(role.access['showSupervisor']) : "✖️",
                    editor: role.access['createSupervisor'] != undefined ? convertBooleanToEmoji(role.access['createSupervisor']) : "✖️"
                },
            })
        }
        const users = await prisma.user.findMany({ where: { ...(+roleId != 0 && { roleId: +roleId }) }, select: { id: true, name: true, email: true, role: { select: { name: true } }, roomMaids: true } })
        sendedData.listUser = users.map(user => ({
            id: user.id,
            name: user.name,
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

const getEditRoleHelper = async (query) => {
    const { id } = query
    let sendedHelper = {
        name: undefined, defaultPath: undefined, access: {
            showSuperAdmin: false,
            createSuperAdmin: false,
            showAdmin: false,
            createAdmin: false,
            showMaid: false,
            createMaid: false,
            showSupervisor: false,
            createSupervisor: false
        }
    }
    try {
        const exist = await prisma.role.findFirstOrThrow({ where: { id: +id } })
        exist.access.keys(key => { sendedHelper[key] = sendedHelper[key] })
        sendedHelper.name = exist.name
        sendedHelper.defaultPath = exist.defaultPath
        return sendedHelper
    } catch (err) {
        ThrowError(err)
    } finally { await PrismaDisconnect() }
}

const getAddEditUserHelper = async (query) => {
    const { firstId, secondId, act } = query
    let accessKeys = {
        access: {
            showSuperAdmin: false,
            createSuperAdmin: false,
            showAdmin: false,
            createAdmin: false,
            showMaid: false,
            createMaid: false,
            showSupervisor: false,
            createSupervisor: false
        }
    }, sendedHelper
    try {
        const listRoles = await prisma.role.findMany({ where: { NOT: [{ AND: [{ id: 'REMOVED' }, { id: 'UNKNOWN' }] }] }, select: { id: true, name: true } })
        if (act != "add") {
            const exist = await prisma.user.findFirstOrThrow({ where: { id: +firstId }, select: { name: true, picture: true, phone: true, birthday: true, nik: true, gender: true, username: true, role: { select: { id: true, name: true } } } })
            sendedHelper = { ...exist }
            if (roleId === 0) roleId = exist.role.id
        } else if (+secondId === 0) secondId = listRoles[0].id
        const shownRoles = await prisma.role.findFirstOrThrow({ where: { id: +secondId } })
        accessKeys.access.keys(key => { shownRoles.access[key] = shownRoles.access[key] || false })
        return { accessKeys, listRole, shownRoles }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const getEditRoomBoyHelper = async (query) => {
    const { firstId } = query
    try {
        let listMaid = await prisma.roomMaid.findMany({ select: { id: true, user: { select: { name: true } } } })
        listMaid.map(maid => ({
            id: maid.id,
            label: maid.user.name
        }))
        let listShift = await prisma.shift.findMany({ select: { id: true, description: true, startTime: true, endTime: true } })
        listShift.map(shift => ({
            id: shift.id,
            label: `${shift.description} | ${shift.startTime} - ${shift.endTime}`
        }))
        let listDepartment = await prisma.department.findMany({ select: { id: true, longDesc: true } })
        if (+firstId === 0) firstId = listMaid[0].id
        let shownMaid = await prisma.roomMaid.findFirstOrThrow({ where: { id: +firstId }, select: { shiftId: true, aliases: true, user: { select: { name: true, email: true, role: { select: { name: true } } } } } })
        shownMaid = {
            name: shownMaid.user.name,
            email: shownMaid.user.email,
            role: shownMaid.user.role.name,
            shiftId: shownMaid.shiftId,
            aliases: shownMaid.aliases
        }
        return { listMaid, listShift, listDepartment, shownMaid }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const getAddRoomBoyHelper = async () => {
    try {
        let listUser = await prisma.user.findMany({ where: { roomMaids: { none: true }}, select: { id: true, name: true, email: true, role: { select: { name: true } } } })
        listUser.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.name
        }))
        let listShift = await prisma.shift.findMany({ select: { id: true, description: true, startTime: true, endTime: true } })
        listShift.map(shift => ({
            id: shift.id,
            label: `${shift.description} | ${shift.startTime} - ${shift.endTime}`
        }))
        let listDepartment = await prisma.department.findMany({ select: { id: true, longDesc: true } })
        return { listUser, listShift, listDepartment }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const addEditUser = async (body, act, userId = undefined) => {
    try {
        console.log(body)
        if (body.email) {
            const emailUssed = await prisma.user.findFirst({ where: { email: body.email } })
            if (emailUssed != null) throw Error(`Email already exist, for user ${emailUssed.name}`)
        }
        if (body.username) {
            const usernameUssed = await prisma.user.findFirst({ where: { username: body.username } })
            if (usernameUssed != null) throw Error(`Username already used by ${usernameUssed.name}`)
        }
        switch (act) {
            case "add":
                if (!body.picture) body.picture = `${process.env.BASE_URL}/assets/profile-pict/default.png`
                if (!body.roleId) body.roleId = 2
                if (body.password && body.password.length > 0) {
                    const salt = await bcrypt.genSalt();
                    body.password = await bcrypt.hash(body.password, salt);
                } else throw Error('Please send a correct password')
                return await prisma.user.create({
                    data: { ...body }
                })
            default:
                await prisma.user.findFirstOrThrow({ where: { id: +userId } })
                if (body.password) {
                    if (body.password.length > 0) {
                        const salt = await bcrypt.genSalt();
                        body.password = await bcrypt.hash(body.password, salt);
                    } else throw Error('Please the password must be atleast has 1 character')
                }
                return await prisma.user.update({ where: { id: +userId }, data: { ...body } })
        }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const addNewRole = async (body) => {
    try {
        const nameExist = await prisma.role.findFirst({ where: { name: body.name } })
        if (nameExist != null) throw Error('Role Name Already Exist')
        return await prisma.role.create({ data: { name: body.name, defaultPath: body.path, access: body.access } })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const editRoleById = async (roleId, body) => {
    try {
        const roleExist = await prisma.role.findFirstOrThrow({ where: { id: roleId }, select: { id: true } })
        return await prisma.role.update({ where: { id: roleExist.id }, data: { name: body.name, defaultPath: body.path, access: body.access } })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const addNewRoomBoy = async (body) => {
    const { userId, shift, aliases, departmentId } = body
    try {
        const [userExist, shiftExist] = await prisma.$transaction([
            prisma.roomMaid.findFirst({ where: { userId } }),
            prisma.shift.findFirstOrThrow({ where: { id: shift } })
        ])
        if (userExist != null) throw Error('User already assign as Maid')
        return await prisma.roomMaid.create({
            data: { shift: { connect: { id: shiftExist.id } }, aliases, user: { connect: { id: userId } }, department: { connect: { id: departmentId } } }
        })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const editRoomBoy = async (maidId, body) => {
    const { shift, aliases, userId, departmentId } = body
    try {
        const [userExist, shiftExist] = await prisma.$transaction([
            prisma.roomMaid.findFirstOrThrow({ where: { id: +maidId } }),
            prisma.shift.findFirstOrThrow({ where: { id: body.shift } })
        ])
        return await prisma.roomMaid.update({ where: { id: maidId }, data: { shift: { connect: { id: shift } }, user: { connect: { id: userId } }, department: { connect: { id: departmentId } }, aliases } })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const deleteRole = async (id) => {
    try {
        const exist = await prisma.role.findFirstOrThrow({ where: { id }, select: { users: true } })
        for (let user of exist.users) {
            await prisma.user.update({ where: { id: user.id }, data: { roleId: 1 } }) //Change to REMOVED
        }
        return await prisma.role.delete({ where: { id } })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getData, addNewRole, editRoleById, addNewRoomBoy, editRoomBoy, deleteRole, addEditUser, getEditRoleHelper, getAddEditUserHelper, getAddRoomBoyHelper, getEditRoomBoyHelper }