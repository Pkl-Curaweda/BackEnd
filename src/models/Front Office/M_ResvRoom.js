const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, generateVoucherNo, getWorkingShifts } = require("../../utils/helper");
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
          connect: { id: roomMaid[0].RoomMaid[0].id}
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

const deleteResvRoomByReservationId = async (reservationId, resvRooms = []) => {
  try {
    resvRooms.forEach(async resvRoom => {
      await prisma.resvRoom.findFirstOrThrow({ where: { id: resvRoom.id } })
      // await prisma.roomMaid.deleteMany({ where: { resvRoomId: resvRoom.id } })
      await prisma.roomChange.deleteMany({ where: { resvRoomId: resvRoom.id } })
      await prisma.resvRoom.delete({ where: { id: resvRoom.id } })
    });
    const ooo = await prisma.oooRoom.findMany({ where: { reservationId }, select: { reservationId: true } })
    ooo.forEach(async ooo => {
      await prisma.oooRoom.deleteMany({ where: { reservationId: ooo.reservationId } })
    })

    const clean = await prisma.cleanRoom.findMany({ where: { reservationId }, select: { reservationId: true } })
    clean.forEach(async clean => {
      await prisma.cleanRoom.deleteMany({ where: { reservationId: clean.reservationId } })
    })

    const dirty = await prisma.dirtyRoom.findMany({ where: { reservationId }, select: { reservationId: true } })
    dirty.forEach(async dirty => {
      await prisma.dirtyRoom.deleteMany({ where: { reservationId: dirty.reservationId } })
    })

    return await prisma.resvRoom.count({ where: { reservation: { id: reservationId } } })
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect();
  }
}

module.exports = { createNewResvRoom, getAllRoomIdReservedByReserverId, deleteResvRoomByReservationId, };