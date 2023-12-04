const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect } = require("../../utils/helper");

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

const createNewResvRoom = async (reservationId, data) => {
  try {
    const resvRoom = await prisma.resvRoom.create({
      data: {
        reservation: {
          connect: {
            id: reservationId
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

const deleteResvRoomByReservationId = async (id) => {
  try {
    const resvRooms = await prisma.resvRoom.findMany({ where: { reservationId: id }, select: { id: true } })
    resvRooms.forEach(async resvRoom => {
      await prisma.roomMaid.deleteMany({ where: { resvRoomId: resvRoom.id } })
      await prisma.roomChange.deleteMany({ where: { resvRoomId: resvRoom.id } })
    });
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect();
  }
}

module.exports = { createNewResvRoom, getAllRoomIdReservedByReserverId, deleteResvRoomByReservationId, };