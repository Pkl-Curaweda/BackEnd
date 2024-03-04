const { it } = require("test")
const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../utils/helper")

const getAll = async (user) => {
    const { cartList } = user, carts = []
    try {
        for (let cart of Object.values(cartList)) {
            const service = await prisma.service.findFirst({ where: { id: cart.id }, select: { id: true, name: true, price: true, picture: true } })
            if (service === null) break;
            carts.push({
                ...service,
                qty: cart.qty,
                priceTotal: service.price * cart.qty
            })
        }
        return carts
    } catch (err) {
        ThrowError(err)
    } finally { await PrismaDisconnect() }
}

const addToCart = async (user, item = { serviceId: undefined, qty: undefined }) => {
    const { id, cartList } = user
    try {
        await prisma.service.findFirstOrThrow({ where: { id: item.serviceId } })
        cartList[item.serviceId] = !cartList[item.serviceId] ? { id: item.serviceId, qty: item.qty } : { id: item.serviceId, qty: cartList[item.serviceId].qty + item.qty }
        return await prisma.user.update({ where: { id }, data: { cartList } })
    } catch (err) {
        ThrowError(err)
    }
}

module.exports = { getAll, addToCart }