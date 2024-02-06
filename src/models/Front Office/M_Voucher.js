const { base } = require("@faker-js/faker")
const math = require('mathjs');
const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../utils/helper")
const { createOooRoom } = require("../House Keeping/M_OOORoom")

const isVoucherValid = async (id) => {
    try {
        const voucher = await prisma.voucher.findFirst({ where: { id } })
        if (voucher === null) throw Error("Voucher is invalid")
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
        await isVoucherValid(voucherId).catch((err) => { throw Error(`${err.message}, but other edited/created data are success`) })
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

const countAfterVoucher = (baseline, voucherArtihmathic) => {
    try{
        console.log('NIHHSAHDI ADJADBASBDJBASD')
        const result = math.evaluate(voucherArtihmathic);
        console.log(baseline, result)
        console.log(result)
        // console.log(baseline result)
        return baseline * result;
    }catch(err){
        ThrowError(err)
    }
}

module.exports = { isVoucherValid, setVoucher,countAfterVoucher }