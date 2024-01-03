const { prisma } = require("../../../prisma/seeder/config");
const { PrismaDisconnect, ThrowError, generateDateBetweenNowBasedOnDays } = require("../../utils/helper");
const { getAllAvailableRoom } = require("../House Keeping/M_Room");

const get = async (skip, take, date) => {
    try {
        const current = new Date();
        date = date || current.toISOString().split("T")[0]
        currTime = `${current.getHours()}:${current.getMinutes()}`
        currDate = current.toDateString();
        let recResv = {
            newReservation: 0, //?New reservation from?
            availableRoom: 0,
            checkIn: 0,
            checkOut: 0,
            occRate: 0
        }

        const availableRoom = await getAllAvailableRoom()
        const { ci, co } = await getCheckInOut();
        const hk = await getHouseKeepingRoomData();
        recResv.availableRoom = availableRoom.length
        recResv.occRate = availableRoom.length / 10 * 100
        recResv.checkIn = ci
        recResv.checkOut = co

        const chrt7day = await get7dayChart();
        const htResv = await prisma.resvRoom.findMany({
            where: {
                created_at: {
                    gte: `${date}T00:00:00.000Z`,
                    lte: `${date}T23:59:59.999Z`
                }
            },
            select: {
                reservationId: true,
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
            },
            skip, take
        })
        return { currTime, currDate, recResv, htResv, hk, chrt7day }
    } catch (err) {
        ThrowError(err);
    } finally {
        await PrismaDisconnect();
    }
}

const get7dayChart = async () => {
    let resvChart = {}, hkChart = { }
    try{
        const dts = generateDateBetweenNowBasedOnDays('past', 7)
        dts.shift();
        console.log(dts)
        dts.forEach(async (dt, ind) => {
            newDt = new Date(dt)
            const dtName =  newDt.toLocaleDateString('en-US', {weekday: 'long'});
            console.log(dtName)
            const rsv = await prisma.resvRoom.findMany({
                where: {
                    created_at: {
                        gte: `${dt}T00:00:00.000Z`,
                        lte: `${dt}T23:59:59.999Z`,
                    }
                },
                select: {
                    reservation: {
                        select: {  
                            checkInDate: true,
                            departureDate: true
                        }
                    },
                    roomId: true
                }
            })
            const ciCo = await getCheckInOut(rsv)
            rsv.forEach(rs => {
                const { roomId } = rs;
                const keyExist = hkChart.hasOwnProperty(roomId);
                if(!keyExist) hkChart[roomId] = 0;
                else hkChart[roomId] = (keyExist ? hkChart[roomId]: 0) + 1
            })
        })
        console.log(resvChart, hkChart)
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect();
    }
}

const getCheckInOut = async (mdl) => {
    let ci = 0, co = 0, onGoResv;
    try {
        if(mdl){ 
            onGoResv = mdl
        }else{
            onGoResv = await prisma.resvRoom.findMany({
                where: {
                    reservation: { onGoingReservation: true }
                },
                select: {
                    reservation: {
                        select: { checkInDate: true, checkoutDate: true }
                    }
                }
            })
        }
        onGoResv.forEach(resv => {
            const { reservation } = resv;
            if(reservation.checkInDate != null){
                if(reservation.checkoutDate != null) co++
                ci++
            } 
        })
        return { ci, co };
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect();
    }
}

const getHouseKeepingRoomData = async () => {
    let status = { vc: 0, vcu: 0, vd: 0, oc: 0, od: 0, ttl: 0 };
    try{
        const rooms = await prisma.room.findMany({ select: { roomStatus: { select: { shortDescription: true } } } })
        rooms.forEach(room => {
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
        })
        status.ttl = rooms.length
        return status
    }catch (err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect();
    }
}

module.exports = { get }