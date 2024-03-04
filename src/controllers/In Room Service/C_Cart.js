const { error, success } = require("../../utils/response")
const cart = require('../../models/In Room Service/M_Cart')
const { ThrowError, PrismaDisconnect } = require("../../utils/helper")
const { prisma } = require("../../../prisma/seeder/config")

const get = async (req, res) => {
    try {
        const carts = await cart.getAll(req.user)
        return success(res, `Showing cart from ${req.user.name}`, carts)
    } catch (err) {
        return error(res, err.message)
    }
}

const addNew = async (req, res) => {
    try {
        const carts = await cart.addToCart(req.user, req.body)
        return success(res, 'Product has been added to chart', carts)
    } catch (err) {
        return error(res, err.message)
    }
}

const clear = async (req, res) => {
    const { id } = req.user
    try {
        const userCart = await prisma.user.update({ where: { id }, data: { cartList: {} }, select: { cartList: true } })
        return success(res, 'Cart Cleared', userCart)
    } catch (err) {
        ThrowError(err)
        return error(res, err.message)
    } finally { await PrismaDisconnect() }
}

module.exports = { get, addNew, clear }