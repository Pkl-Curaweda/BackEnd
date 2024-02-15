const { prisma } = require("../../../prisma/seeder/config");
const { PrismaDisconnect, ThrowError, generateDateBetweenNowBasedOnDays, paginate, paginateFO, isDateInRange } = require("../../utils/helper");
const { getAllAvailableRoom } = require("../House Keeping/M_Room");

const get = async (page, perPage, date) => {
    try {
        const current = new Date();
        date = date || current.toISOString().split("T")[0]
        currTime = `${current.getHours()}:${current.getMinutes()}`
        currDate = current.toDateString();
        const newDt = new Date(date)
        const dtName = newDt.toLocaleDateString('en-US', { weekday: 'long' });
        const hk = await getHouseKeepingRoomData();
        const currData = await getCurrentDayData(date, hk.ttl)
        const { resvChart, hkChart } = await getChart();
        resvChart[dtName] = {
            ident: dtName,
            nw: currData.newReservation,
            ci: currData.checkIn,
            co: currData.checkOut
        }
        const searchedDate = date
        const htResv = await paginateFO(prisma.resvRoom, { page, name: "reservation", perPage }, {
            where: {
                created_at: {
                    gte: `${date}T00:00:00.000Z`,
                    lte: `${date}T23:59:59.999Z`
                },
                deleted: false
            },
            select: {
                reservationId: true,
                roomId: true,
                created_at: true,
                reservation: {
                    select: {
                        resvStatus: {
                            select: {
                                rowColor: true,
                                textColor: true
                            }
                        },
                        reserver: {
                            select: {
                                resourceName: true,
                                guest: { select: { name: true } }
                            }
                        }
                    }
                }
            }
        })
        return { currTime, currDate, currData, resv: { searchedDate, ...htResv }, resvChart, hkChart, hk }
    } catch (err) {
        ThrowError(err);
    } finally {
        await PrismaDisconnect();
    }
}

const getChart = async () => {
    let resvChart = {}, hkChart = { 101: 0, 102: 0, 103: 0, 104: 0, 105: 0, 106: 0, 107: 0, 108: 0, 109: 0, 110: 0 }
    try {
        const dts = generateDateBetweenNowBasedOnDays('future', 7)
        const resvRoom = await prisma.resvRoom.findMany({
            where: {
                reservation: {
                    OR: [
                        { arrivalDate: { gte: `${dts[0]}T00:00:00.000Z` } },
                        { departureDate: { lte: `${dts[dts.length - 1]}T23:59:59.999Z` } },
                    ]
                }
            },
            select: { roomId: true, reservation: { select: { inHouseIndicator: true, arrivalDate: true, departureDate: true, checkInDate: true, checkoutDate: true, created_at: true, inHouseIndicator: true } } }
        })

        // dts.reverse()
        for (dt of dts) {
            let data = { nw: 0, ci: 0, co: 0 }
            newDt = new Date(dt)
            const rsv = resvRoom.filter(rsv => {
                let [arrivalDate, departureDate] = [rsv.reservation.arrivalDate, rsv.reservation.departureDate]
                return isDateInRange(new Date(dt), new Date(`${arrivalDate.toISOString().split('T')[0]}T00:00:00.000Z`), new Date(`${departureDate.toISOString().split('T')[0]}T23:59:59.999Z`));
            })
            for (let rs of rsv) {
                if (rs.reservation.created_at >= `${dt}T00:00:00.000Z` && rs.reservation.created_at < `${dt}T23:59:59.999Z`) data.nw++
                if (rs.reservation.checkInDate >= `${dt}T00:00:00.000Z` && rs.reservation.checkInDate < `${dt}T23:59:59.999Z`) data.ci++
                if (rs.reservation.checkoutDate >= `${dt}T00:00:00.000Z` && rs.reservation.checkoutDate < `${dt}T23:59:59.999Z`) data.co++

                hkChart[rs.roomId]++
            }
            const dtName = newDt.toLocaleDateString('en-US', { weekday: 'long' });
            // for(let rs of resvRoom){
            //     if(`${dt}T00:00:00.000Z` >= rs.reservation.arrivalDate && `${dt}T23:59:59.999Z` < rs.reservation.departureDate) 
            // }
            resvChart[dtName] = { ident: dtName, ...data }
        }
        hkChart = Object.values(hkChart)
        return { resvChart, hkChart }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect();
    }
}

const getCurrentDayData = async (dt, ttlRoom) => {
    let recResv = { newReservation: 0, availableRoom: 0, checkIn: 0, checkOut: 0, occRate: 0 }
    try {
        const avRoom = await getAllAvailableRoom()
        const [nw, ci, co] = await prisma.$transaction([
            prisma.resvRoom.count({
                where: {
                    reservation: {
                        onGoingReservation: true,
                        created_at: {
                            gte: `${dt}T00:00:00.000Z`,
                            lte: `${dt}T23:59:59.999Z`,
                        }
                    }
                }
            }),
            prisma.resvRoom.count({
                where: {
                    reservation: {
                        onGoingReservation: true,
                        checkInDate: {
                            gte: `${dt}T00:00:00.000Z`,
                            lte: `${dt}T23:59:59.999Z`,
                        }
                    }
                }
            }),
            prisma.resvRoom.count({
                where: {
                    reservation: {
                        onGoingReservation: true,
                        checkoutDate: {
                            gte: `${dt}T00:00:00.000Z`,
                            lte: `${dt}T23:59:59.999Z`,
                        }
                    }
                }
            })
        ])
        recResv.availableRoom = avRoom.length
        recResv.checkIn = ci
        recResv.checkOut = co
        recResv.newReservation = nw
        recResv.occRate = (ttlRoom - recResv.availableRoom) / ttlRoom * 100
        return recResv
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect();
    }
}

const getHouseKeepingRoomData = async () => {
    let status = { vc: 0, vcu: 0, vd: 0, oc: 0, od: 0, ttl: 0 };
    try {
        const rooms = await prisma.room.findMany({ select: { roomStatus: { select: { shortDescription: true } } } })
        for (room of rooms) {
            const shtDesc = room.roomStatus.shortDescription
            switch (shtDesc) {
                case 'VC':
                    status.vc++
                    break;
                case 'VCU':
                    status.vcu++
                    break;
                case 'VD':
                    status.vd++
                    break;
                case 'OC':
                    status.oc++
                    break
                case 'OD':
                    status.od++
                    break
                default:
                    break;
            }

        }
        status.ttl = rooms.length
        return status
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect();
    }
}

module.exports = { get }