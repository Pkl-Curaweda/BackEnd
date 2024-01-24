const { rm } = require("fs");
const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, splitDateTime } = require("../../utils/helper");

const ChangeRoom = async (id, reservationId, body) => {
  try {
    const { roomId } = await prisma.resvRoom.findFirstOrThrow({
      where: { id, reservationId },
      select: { id: true, roomId: true },
    });

    console.log(roomId);

    const changeRoomLog = await prisma.roomChange.create({
      data: {
        roomFromId: roomId,
        roomToId: body.roomId,
        resvRoomId: id,
        reason: body.note
      },
    });

    const updatedResvRoom = await prisma.resvRoom.update({
      where: { id },
      data: { roomId: body.roomId, arrangmentCodeId: body.arrangmentCodeId },
    });

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        roomType: body.newRoomType,
        rate: body.arrangmentCodeId,
      },
    });

    return { updatedResvRoom, changeRoomLog, updatedRoom };
  } catch (err) {
    ThrowError(err);
  }
};

const getAllRoomChange = async (q) => {
  let { page = 1, perPage = 5, from, to } = q
  let roomChangeData = [];
  if (from === undefined) from = splitDateTime(new Date().toISOString()).date
  if (to === undefined){
    to = new Date()
    to = splitDateTime(to.setDate(new Date(from).getDate() + 7)).date
  }
  try {
    const [total, roomChanges] = await prisma.$transaction([
      prisma.roomChange.count(),
      prisma.roomChange.findMany({
        where: {
          created_at: {
            gte: `${from}T00:00:00.000Z`,
            lte: `${to}T23:59:59.999Z`
          }
        },
        select: {
          created_at: true,
          resvRoom: {
            select: {
              reservation: {
                select: {
                  id: true,
                  arrivalDate: true,
                  departureDate: true,
                  reserver: {
                    select: { guest: { select: { name: true } } }
                  }
                }
              }
            }
          },
          roomFromId: true,
          roomToId: true,
          reason: true
        },
        skip: (page - 1) * perPage,
        take: +perPage
      })
    ])
    for (let rmChg of roomChanges) {
      roomChangeData.push({
        changeDate: splitDateTime(rmChg.created_at).date,
        arrival: splitDateTime(rmChg.resvRoom.reservation.arrivalDate).date,
        departure: splitDateTime(rmChg.resvRoom.reservation.departureDate).date,
        time: splitDateTime(rmChg.created_at).time,
        roomNo: rmChg.roomFromId,
        moveTo: rmChg.roomToId,
        reason: rmChg.reason,
        resvNo: rmChg.resvRoom.reservation.id,
        guestName: rmChg.resvRoom.reservation.reserver.guest.name
      })
    }
    const lastPage = Math.ceil(total / perPage);
    return {
      roomChangeData, meta: {
        total,
        currPage: page,
        lastPage,
        perPage,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null
      }
    }
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

module.exports = { ChangeRoom, getAllRoomChange };
