const { base } = require("@faker-js/faker")
const math = require('mathjs');
const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../utils/helper")
const { createOooRoom } = require("../House Keeping/M_OOORoom")

const isVoucherValid = async (id) => {
    try {
        const voucher = await prisma.voucher.findFirst({ where: { id } })
        if (voucher === null) return false
        return voucher
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const setVoucher = async (voucherId, resvRoomId, userId) => {
    try {
        const resvRoom = await prisma.resvRoom.findFirstOrThrow({ where: { id: +resvRoomId }, include: { reservation: true } })
        const validVoucher = await isVoucherValid(voucherId)
        if(validVoucher === false) return false
        if (voucherId === process.env.COMP_VOUCHER) await createOooRoom("COMP", {
            room: {
                connect: { id: resvRoom.roomId }
            },
            user: {
                connect: { id: userId }
            },
            reason: `Added from Set Voucher`,
            from: resvRoom.reservation.arrivalDate,
            until: resvRoom.reservation.departureDate,
            description: "-"
        })
        return await prisma.resvRoom.update({ where: { id: resvRoomId }, data: { voucherId } })
    } catch (err) {
        ThrowError(err)
    } finally { await PrismaDisconnect() }
}

const countAfterVoucher = async (baseline, voucherId) => {
    try{
        let result = baseline
        const voucher = await isVoucherValid(voucherId)
        if(voucher != null) result -= result * voucher.cutPercentage / 100
        return result;
    }catch(err){
        ThrowError(err)
    }
}

module.exports = { isVoucherValid, setVoucher,countAfterVoucher }