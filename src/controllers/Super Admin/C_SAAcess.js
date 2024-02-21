const { prisma } = require("../../../prisma/seeder/config")
const { error, success } = require("../../utils/response")
const modelSAAcess = require('../../models/Super Admin/M_SAAccess')
const { mode } = require("mathjs")

const get = async (req, res) => {
    try {
        const data = await modelSAAcess.getData(req.query)
        return success(res, 'Showing Access Page', data)
    } catch (err) {
        return error(res, err.message)
    }
}

const postNewUser = async (req, res) => {
    try {
        const user = await modelSAAcess.addNewUser(req.body)
        return success(res, `User ${user.name} Created Successfully`, user)
    } catch (err) {
        return error(res, err.message)
    }
}

const postAddEditUser = async (req, res) => {
    try {
        if (req.file) req.body.picture = process.env.BASE_URL + '/assets/lost-found/' + req.file.filename
        const user = await modelSAAcess.addEditUser(req.body, req.params.action, +req.params.id || 0)
        return success(res, 'DJSBAJDBAS', user)
    } catch (err) {
        return error(res, err.message)
    }
}

const putEditUserWithImage = async (req, res) => {
    try {
        const user = await modelSAAcess.editUser(req.params.id, req.body)
    } catch (err) {
        return error(res, err.message)
    }
}

const postNewRole = async (req, res) => {
    try {
        const role = await modelSAAcess.addNewRole(req.body)
        return success(res, `Role ${role.name} Created Successfully`, role)
    } catch (err) {
        return error(res, err.message)
    }
}

const putEditRole = async (req, res) => {
    try {
        const role = await modelSAAcess.editRoleById(req.body.id, req.body)
        return success(res, `Role ${role.name} Updated Successfully`, role)
    } catch (err) {
        return error(res, err.message)
    }
}

const postNewRoomBoy = async (req, res) => {
    try {
        const roomBoy = await modelSAAcess.addNewRoomBoy(req.body)
        return success(res, `${roomBoy.aliases} assign as Maid Successfully`, roomBoy)
    } catch (err) {
        return error(res, err.message)
    }
}

const putEditRoomBoy = async (req, res) => {
    try {
        const roomBoy = await modelSAAcess.editRoomBoy(+req.params.id, req.body)
        return success(res, `${roomBoy.aliases} Edited Successfully`, roomBoy)
    } catch (err) {
        return error(res, err.message)
    }
}

const deleteRole = async (req, res) => {
    try {
        const deletedRole = await modelSAAcess.deleteRole(+req.params.id)
        return success(res, `${deletedRole.name} Deleted Succesfully`, deletedRole)
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = { get, postNewRole, putEditRole, postNewUser, putEditUserWithImage, postNewRoomBoy, putEditRoomBoy, deleteRole, postAddEditUser }