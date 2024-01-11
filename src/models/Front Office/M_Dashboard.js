const { prisma } = require("../../../prisma/seeder/config");
const { PrismaDisconnect, ThrowError, generateDateBetweenNowBasedOnDays, paginate, paginateFO } = require("../../utils/helper");
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
        const searchedDate  = date
        const htResv = await paginateFO(prisma.resvRoom, { page, name: "reservation", perPage }, { 
            where: {
                created_at: {
                    gte: `${date}T00:00:00.000Z`,
                    lte: `${date}T23:59:59.999Z`
                }
            },
            select: {
                reservationId: true,
                roomId: true,
                created_at: true,
                reservation: {
                    select: {
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
    let resvChart = {}, hkChart = {}
    try {
        const dts = generateDateBetweenNowBasedOnDays('past', 7)
        for(dt of dts) {
            const rsv = await prisma.resvRoom.findMany({
                where: {
                    created_at: {
                        gte: `${dt}T00:00:00.000Z`,
                        lte: `${dt}T23:59:59.999Z`,
                    }
                },
                select: { roomId: true }
            })
            for (rs of rsv) {
                console.log(rs)
                const { roomId } = rs
                const keyExist = hkChart.hasOwnProperty(roomId);
                hkChart[roomId] = !keyExist ? 1 : hkChart[roomId]++
            }
        }

        dts.shift()
        dts.reverse();
        for (dt of dts) {
            newDt = new Date(dt)
            const dtName = newDt.toLocaleDateString('en-US', { weekday: 'long' });
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
                }),
            ])
            
            resvChart[dtName] = { ident: dtName, nw, ci, co }
        }
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
        recResv.occRate = ( ttlRoom - recResv.availableRoom) / ttlRoom * 100
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