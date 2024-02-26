const { prisma } = require("../../../prisma/seeder/config")
const bcrypt = require("bcrypt");
const M_User = require('../Authorization/M_User')
const { ThrowError, PrismaDisconnect, existingAccess, convertBooleanToHex } = require("../../utils/helper");

const getData = async (query) => {
    let { roleId } = query, sendedData = { listRole: [], listUser: undefined }
    try {
        const roles = await prisma.role.findMany({ where: { NOT: [{ id: 1 }, { id: 2 }], deleted: false }, select: { id: true, name: true, access: true } })
        for (let role of roles) {
            console.log("============================", role)
            sendedData.listRole.push({
                id: role.id,
                name: role.name,
                superAdmin: {
                    reader: role.access['showSuperAdmin'] != undefined ? convertBooleanToHex(role.access['showSuperAdmin']) : `#e7e7e7`,
                    editor: role.access['createSuperAdmin'] != undefined ? convertBooleanToHex(role.access['createSuperAdmin']) : `#e7e7e7`
                },
                admin: {
                    reader: role.access['showAdmin'] != undefined ? convertBooleanToHex(role.access['showAdmin']) : "#e7e7e7",
                    editor: role.access['createAdmin'] != undefined ? convertBooleanToHex(role.access['createAdmin']) : "#e7e7e7"
                },
                roomBoy: {
                    reader: role.access['showMaid'] != undefined ? convertBooleanToHex(role.access['showMaid']) : "#e7e7e7",
                    editor: role.access['createMaid'] != undefined ? convertBooleanToHex(role.access['createMaid']) : "#e7e7e7"
                },
                supervisor: {
                    reader: role.access['showSupervisor'] != undefined ? convertBooleanToHex(role.access['showSupervisor']) : "#e7e7e7",
                    editor: role.access['createSupervisor'] != undefined ? convertBooleanToHex(role.access['createSupervisor']) : "#e7e7e7"
                },
            })
        }
        if (+roleId != 0) {
            const roleExist = await prisma.role.findFirst({ where: { id: +roleId } })
            const users = await prisma.user.findMany({ where: { ...(+roleId != 0 && { roleId: +roleId }), deleted: false }, select: { id: true, name: true, email: true, role: { select: { name: true } }, roomMaids: true } })
            // if (users.length < 1) throw Error(`No User Has ${roleExist?.name} Role`)
            sendedData.listUser = users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.name,
                isRoomBoy: user.roomMaids.length <= 0 ? "✖️" : "✔️"
            }))
        }
        return sendedData
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const getEditRoleHelper = async (query) => {
    const { firstId } = query
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
        const exist = await prisma.role.findFirstOrThrow({ where: { id: +firstId } })
        Object.keys(exist.access).forEach(key => { sendedHelper.access[key] = exist.access[key] })
        sendedHelper.name = exist.name
        sendedHelper.defaultPath = exist.defaultPath
        return sendedHelper
    } catch (err) {
        ThrowError(err)
    } finally { await PrismaDisconnect() }
}

const getAddEditUserHelper = async (query) => {
    let { firstId, secondId, act } = query
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
    }, shownUser
    try {
        const listRoles = await prisma.role.findMany({ where: { NOT: [{ name: "REMOVED" }, { name: "UNKNOWN" }], deleted: false }, select: { id: true, name: true } })
        if (act != "add") {
            const exist = await prisma.user.findFirstOrThrow({ where: { id: +firstId, deleted: false }, select: { name: true, picture: true, phone: true, email: true, birthday: true, nik: true, gender: true, username: true, role: { select: { id: true, name: true } } } })
            shownUser = { ...exist }
            if (+secondId === 0) secondId = exist.role.id
        } else if (+secondId === 0) secondId = listRoles[0].id
        const shownRoles = await prisma.role.findFirstOrThrow({ where: { id: +secondId } })
        Object.keys(accessKeys.access).forEach(key => { shownRoles.access[key] = shownRoles.access[key] || false })
        return { listRoles, shownRoles, shownUser }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const getEditRoomBoyHelper = async (query) => {
    let { firstId } = query
    try {
        let listMaid = await prisma.roomMaid.findMany({ where: { deleted: false, }, select: { id: true, aliases: true, departmentId: true, shiftId: true, user: { select: { name: true, picture: true, email: true, role: { select: { name: true } } } } } })
        listMaid.map(maid => ({
            id: maid.id,
            name: maid.user.name,
            email: maid.user.email,
            picture: maid.user.picture,
            role: maid.user.role.name,
            shiftId: maid.shiftId,
            aliases: maid.aliases,
            departmentId: maid.departmentId
        }))
        let listShift = await prisma.shift.findMany({ select: { id: true, description: true, startTime: true, endTime: true } })
        listShift = listShift.map(shift => ({
            id: shift.id,
            label: `${shift.description} | ${shift.startTime} - ${shift.endTime}`
        }))
        let listDepartment = await prisma.department.findMany({ select: { id: true, longDesc: true } })
        if (+firstId === 0) firstId = listMaid[0].id
        let shownMaid = await prisma.roomMaid.findFirstOrThrow({ where: { id: +firstId, deleted: false }, select: { shiftId: true, aliases: true, user: { select: { name: true, email: true, role: { select: { name: true } } } } } })
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
        let listUser = await prisma.user.findMany({ where: { roomMaids: { none: {} }, deleted: false, NOT: [{ roleId: 1 }, { roleId: 2 }, { roleId: 8 }] }, select: { id: true, name: true, picture: true, email: true, role: { select: { name: true } } } })
        listUser.map(user => ({
            id: user.id,
            name: user.name,
            picture: user.picture,
            email: user.email,
            role: user.role.name
        }))
        let listShift = await prisma.shift.findMany({ select: { id: true, description: true, startTime: true, endTime: true } })
        listShift = listShift.map(shift => ({
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
        if (body.email) {
            const emailUssed = await prisma.user.findFirst({ where: { email: body.email } })
            if (emailUssed != null) throw Error(`Email already exist, for user ${emailUssed.name}`)
        }
        if (body.username) {
            const usernameUssed = await prisma.user.findFirst({ where: { username: body.username } })
            if (usernameUssed != null) throw Error(`Username already used by ${usernameUssed.name}`)
    }
    let user
        switch (act) {
            case "add":
                if (!body.picture) body.picture = `${process.env.BASE_URL}/assets/profile-pict/default.jpg`
                body.roleId = !body.roleId ? 2 : +body.roleId
                if (body.password && body.password.length > 0) {
                    const salt = await bcrypt.genSalt();
                    body.password = await bcrypt.hash(body.password, salt);
                } else throw Error('Please send a correct password')
                user = await prisma.user.create({
                    data: { ...body }
                })
                return { message: "User created Successfully", data: user }
            default:
                await prisma.user.findFirstOrThrow({ where: { id: +userId } })
                if (body.password) {
                    if (body.password.length > 0) {
                        const salt = await bcrypt.genSalt();
                        body.password = await bcrypt.hash(body.password, salt);
                    } else throw Error('Please the password must be atleast has 1 character')
                }
                user = await prisma.user.update({ where: { id: +userId }, data: { ...body } })
                return { message: "User edited Successfully", data: user }
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
        const data = await prisma.role.update({ where: { id: roleExist.id }, data: { name: body.name, defaultPath: body.path, access: body.access } })
        console.log(data)
        return data
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
    const { shift, aliases, departmentId } = body
    try {
        const [userExist, shiftExist] = await prisma.$transaction([
            prisma.roomMaid.findFirstOrThrow({ where: { id: +maidId } }),
            prisma.shift.findFirstOrThrow({ where: { id: body.shift } })
        ])
        return await prisma.roomMaid.update({ where: { id: maidId }, data: { shift: { connect: { id: shift } }, department: { connect: { id: departmentId } }, aliases } })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const deleteRole = async (id) => {
    try {
        const [exist, deletedData] = await prisma.$transaction([
            prisma.role.findFirstOrThrow({ where: { id } }),
            prisma.role.update({ where: { id }, data: { deleted: true } })
        ])
        return { message: `Role ${exist.name} successfully deleted`, data: deletedData }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const deleteUser = async (id) => {
    try {
        const [exist, deletedData] = await prisma.$transaction([
            prisma.user.findFirstOrThrow({ where: { id } }),
            prisma.user.update({ where: { id }, data: { deleted: true } })
        ])
        return { message: `User ${exist.name} successfully deleted`, data: deletedData }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const deleteRoomMaid = async (id) => {
    try {
        const [exist, deletedData] = await prisma.$transaction([
            prisma.roomMaid.findFirstOrThrow({ where: { id } }),
            prisma.roomMaid.update({ where: { id }, data: { deleted: true } })
        ])
        return { message: `Room Maid ${exist.aliases} successfully deleted`, data: deletedData }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}
module.exports = { getData, addNewRole, editRoleById, addNewRoomBoy, editRoomBoy, deleteRole, addEditUser, getEditRoleHelper, getAddEditUserHelper, getAddRoomBoyHelper, getEditRoomBoyHelper, deleteRole, deleteUser, deleteRoomMaid }