const { prisma } = require("../../../prisma/seeder/config");
const { PrismaDisconnect, ThrowError, generateDateBetweenNowBasedOnDays, paginate, paginateFO, isDateInRange, splitDateTime } = require("../../utils/helper");
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
            ident: dtName.substring(0, 3),
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
    let resvChart = {}, hkChart = {}
    try {
        await prisma.room.findMany({ where: { deleted: false, NOT: { id: 0 } }, select: { id: true } }).then(rooms =>{
            for(let room of rooms)  hkChart[room.id] = { label: room.id, value: 0 }
        })
        const currentDay = new Date()
        const currentMonth = (currentDay.getMonth() + 1).toString().padStart(2, '0');
        const lastDayOfMonth = new Date(currentDay.getFullYear(), currentDay.getMonth() + 1, 0);
        const [arrivalDate, departureDate] = [
            `${currentDay.getFullYear()}-${currentMonth}-01`, // Note: Months are zero-based in JavaScript Date, so we add 1
            `${currentDay.getFullYear()}-${currentMonth}-${lastDayOfMonth.getDate()}`
        ];
        const resvRoom = await prisma.resvRoom.findMany({
            where: {
                deleted: false,
                room: {
                    deleted: false
                },
                reservation: {
                    OR: [
                        { arrivalDate: { gte: `${arrivalDate}T00:00:00.000Z` } },
                        { departureDate: { lte: `${departureDate}T23:59:59.999Z` } },
                    ]
                }
            },
            select: { roomId: true, reservation: { select: { inHouseIndicator: true, arrivalDate: true, departureDate: true, checkInDate: true, checkoutDate: true, created_at: true, inHouseIndicator: true } } }
        })

        const dts = generateDateBetweenNowBasedOnDays("past", 7).reverse()
        for (dt of dts) {
            let data = { nw: 0, ci: 0, co: 0 }
            for (const rsv of resvRoom) {
                let createdAt = rsv.reservation.created_at;
                let checkIn = rsv.reservation.checkInDate;
                let checkout = rsv.reservation.checkoutDate;
                let [arrivalDate, departureDate] = [rsv.reservation.arrivalDate, rsv.reservation.departureDate];

                if (isDateInRange(new Date(dt), new Date(`${splitDateTime(createdAt).date}T00:00:00.000Z`), new Date(`${splitDateTime(createdAt).date}T23:59:59.999Z`))) data.nw++;
                if (isDateInRange(new Date(dt), new Date(`${splitDateTime(checkIn).date}T00:00:00.000Z`), new Date(`${splitDateTime(checkIn).date}T23:59:59.999Z`))) data.ci++;
                if (isDateInRange(new Date(dt), new Date(`${splitDateTime(checkout).date}T00:00:00.000Z`), new Date(`${splitDateTime(checkout).date}T23:59:59.999Z`))) data.co++;

                if (isDateInRange(new Date(dt), new Date(`${arrivalDate.toISOString().split('T')[0]}T00:00:00.000Z`), new Date(`${departureDate.toISOString().split('T')[0]}T23:59:59.999Z`))) {
                    hkChart[rsv.roomId].value++;
                }
            }
            const dtName = new Date(dt).toLocaleDateString('en-US', { weekday: 'long' });
            resvChart[dtName] = { ident: dtName.substring(0, 3), ...data };
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
                    deleted: false,
                    reservation: {
                        created_at: {
                            gte: `${dt}T00:00:00.000Z`,
                            lte: `${dt}T23:59:59.999Z`,
                        }
                    }
                }
            }),
            prisma.resvRoom.count({
                where: {
                    deleted: false,
                    reservation: {
                        checkInDate: {
                            gte: `${dt}T00:00:00.000Z`,
                            lte: `${dt}T23:59:59.999Z`,
                        }
                    }
                }
            }),
            prisma.resvRoom.count({
                where: {
                    deleted: false,
                    reservation: {
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
        recResv.occRate = parseInt((ttlRoom - recResv.availableRoom) / ttlRoom * 100)
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
        const rooms = await prisma.room.findMany({ where: { NOT: [{ id: 0 }], deleted: false }, select: { roomStatus: { select: { shortDescription: true } } } })
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