const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, generateVoucherNo } = require("../../utils/helper");

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
    const voucherNo = await generateVoucherNo()
    const resvRoom = await prisma.resvRoom.create({
      data: {
        reservation: {
          connect: { id }
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
        voucherNo
      }
    })
    return resvRoom;
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect();
  }
}

const deleteResvRoomByReservationId = async (reservationId) => {
  try {
    const resvRooms = await prisma.resvRoom.findMany({ where: { reservationId }, select: { id: true } })
    resvRooms.forEach(async resvRoom => {
      await prisma.roomMaid.deleteMany({ where: { resvRoomId: resvRoom.id } })
      await prisma.roomChange.deleteMany({ where: { resvRoomId: resvRoom.id } })
      await prisma.resvRoom.delete({ where: { id: resvRoom.id } })
    });
    await prisma.oooRoom.deleteMany({ where: { reservationId } })
    await prisma.cleanRoom.deleteMany({ where: { reservationId } })
    await prisma.dirtyRoom.deleteMany({ where: { reservationId } })
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect();
  }
}

module.exports = { createNewResvRoom, getAllRoomIdReservedByReserverId, deleteResvRoomByReservationId, };