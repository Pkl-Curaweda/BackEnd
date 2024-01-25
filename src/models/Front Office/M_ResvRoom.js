const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, generateVoucherNo, getWorkingShifts, isRoomAvailable, isArrangementMatch } = require("../../utils/helper");
const { assignRoomMaid } = require("../House Keeping/M_RoomMaid");

const getAllRoomIdReservedByReserverId = async (reserverId) => {
  let reservedRoom = [];
  try {
    const reservation = await prisma.reservation.findFirst({ where: { reserverId } });
    if (!reservation) return Error("Invalid Reserver Id");
    const rooms = await prisma.resvRoom.findMany({
      where: { reservationId: reservation.id },
      select: { roomId: true },
    });
    rooms.forEach((room) => {
      reservedRoom.push(room.roomId);
    });
    return reservedRoom;
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect();
  }
};

const createNewResvRoom = async (id, data) => {
  try {
    const reservation = await prisma.reservation.findFirst({ where: { id } })
    await isRoomAvailable({ arr: reservation.arrivalDate.toISOString(), dep: reservation.departureDate.toISOString() }, data.roomId)
    await isArrangementMatch(data.roomId, data.arrangmentCode)
    const voucherNo = await generateVoucherNo()
    const roomMaid = await getWorkingShifts(new Date())
    const resvRoom = await prisma.resvRoom.create({
      data: {
        reservation: {
          connect: {
            id,
            resvStatus: { id: data.resvStatusId }
          }
        },
        room: {
          connect: {
            id: data.roomId
          }
        },
        arrangment: {
          connect: {
            id: data.arrangmentCode
          }
        },
        voucherNo,
        roomMaids: {
          connect: { id: roomMaid[0].RoomMaid[0].id }
        }
      }
    })
    return resvRoom;
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect();
  }
}

module.exports = { createNewResvRoom, getAllRoomIdReservedByReserverId };