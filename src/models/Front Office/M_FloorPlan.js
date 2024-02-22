const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect } = require("../../utils/helper");


const getAllStatus = async () => {
  try {
    const currDate = new Date().toISOString().split('T')[0]
    const [rooms, resv] = await prisma.$transaction([
      prisma.room.findMany({
        where: { deleted: false },
        select: {
          id: true,
          roomStatus: {
            select: {
              rowColor: true,
              textColor: true
            }
          }
        }, orderBy: { id: 'asc' }
      }),
      prisma.resvRoom.findMany({
        where: {
          reservation: { NOT: [{ specialTreatmentId: null }], onGoingReservation: true }
        }, select: { roomId: true, reservation: { select: { specialTreatment: { select: { rowColor: true, textColor: true } } } } }, orderBy: { roomId: 'asc' }
      })
    ])
    for (let rsv of resv) {
      const { roomId } = rsv
      rooms[roomId - 101] = {
        id: roomId,
        roomStatus: {
          ...rsv.reservation.specialTreatment
        }
      }
    }
    return rooms
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const getFloorPlanByDate = async (dateRange) => {
  try {
    let listRoom = [], [startTime, endTime] = dateRange.split(' ')
    const rooms = await prisma.room.findMany({ where: { deleted: false } })
    for (let room of rooms) {
      listRoom.push({
        id: `${room.id}`,
        roomStatus: {
          rowColor: "#ffffff",
          textColor: "#000000"
        }
      })
    }
    const resv = await prisma.resvRoom.findMany({
      where: {reservation:{
        AND: [
          {arrivalDate: { gte: `${startTime}T00:00:00.000Z` }},
          {departureDate: { lte: `${endTime}T23:59:59.999Z` }}
        ]
      } },
      select: {
        roomId: true,
        reservation: { select: { specialTreatmentId: true, specialTreatment: true } }
      }
    })

    for(let res of resv){
      listRoom[res.roomId - 101].roomStatus = {
        rowColor: res.reservation.specialTreatmentId != null ? res.reservation.specialTreatment.rowColor : "#f8fdf7",
        textColor: res.reservation.specialTreatmentId != null ? res.reservation.specialTreatment.textColor : "#0000f1"
      }
    }
    return listRoom
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

module.exports = { getAllStatus, getFloorPlanByDate };
