const { base } = require("@faker-js/faker")
const math = require('mathjs');
const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, splitDateTime } = require("../../utils/helper")
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
        if (validVoucher === false) return false
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
    try {
        let result = baseline
        const voucher = await isVoucherValid(voucherId)
        if (voucher != null) result -= result * voucher.cutPercentage / 100
        return result;
    } catch (err) {
        ThrowError(err)
    }
}

const addEditVoucher = async (body, act) => {
    try {
        const data = {
            id: body.voucherName,
            abilites: body.description,
            cutPercentage: body.discount,
            trackComp: body.complimentary,
            trackHU: body.houseUse,
            expired_at: body.expireAt
        }
        if (data.cutPercentage > 100) throw Error('Discount cannot set higher more than 100')
        if (act === "add") {
            const exist = await prisma.voucher.findFirst({ where: { id: data.id, expired: false } })
            if (exist != null) throw Error('Voucher Name Already exist')
        }
        return await prisma.voucher.upsert({
            where: { id: data.id },
            create: { ...data },
            update: { ...data }
        })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const getDetailVoucherById = async (id) => {
    try {
        const voucher = await prisma.voucher.findFirstOrThrow({ where: { id }, select: { id: true, abilites: true, cutPercentage: true, trackComp: true, trackHU: true, expired_at: true } })
        return {
            voucherName: voucher.id,
            description: voucher.abilites,
            discount: voucher.cutPercentage,
            complimentary: voucher.trackComp,
            houseUse: voucher.trackHU,
            expireAt: voucher.expired_at != null ? splitDateTime(voucher.expired_at).date : voucher.expired_at,
        }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const deleteVoucher = async (id) => {
    try {
        await prisma.voucher.findFirstOrThrow({ where: { id } })
        return await prisma.voucher.delete({ where: { id } })
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const getAllVoucher = async (q) => {
    let { date, search } = q, startDate, endDate
    if (date != undefined) [startDate, endDate] = date.split('T')
    try {
        let vouchers = await prisma.voucher.findMany({
            where: {
                id: { contains: search },
                ...(date != undefined && {
                    AND: [
                        { expired_at: { gte: `${startDate}T00:00:00.000Z` } },
                        { expired_at: { lte: `${endDate}T23:59:59.999Z` } }
                    ]
                })
            }, select: { id: true, abilites: true, cutPercentage: true, trackComp: true, trackHU: true, expired_at: true, rowColor: true },
            orderBy: { created_at: 'desc' }
        })
        if (startDate && endDate) {
            let permaVoucher = await prisma.voucher.findMany({
                where: {
                    id: { contains: search },
                    expired_at: null
                }, select: { id: true, abilites: true, cutPercentage: true, trackComp: true, trackHU: true, expired_at: true, rowColor: true },
                orderBy: { created_at: 'desc' }
            })
            for (let permanent of permaVoucher) {
                vouchers.push(permanent)
            }
        }
        vouchers = vouchers.map(voucher => ({
            voucherName: voucher.id,
            description: voucher.abilites,
            discount: `${voucher.cutPercentage}%`,
            complimentary: voucher.trackComp ? "✅" : "❎",
            houseUse: voucher.trackHU ? "✅" : "❎",
            expireAt: voucher.expired_at != null ? splitDateTime(voucher.expired_at).date : '∞',
            rowColor: voucher.rowColor
        }))
        return vouchers
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { isVoucherValid, setVoucher, countAfterVoucher, addEditVoucher, getAllVoucher, deleteVoucher, getDetailVoucherById }