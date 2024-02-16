const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, generateVoucherNo, getWorkingShifts, isRoomAvailable, isArrangementMatch, generateDeleteDate } = require("../../utils/helper");
const { assignRoomMaid } = require("../House Keeping/IMPPS/M_RoomMaid");
const { addNewInvoiceFromArticle } = require("./M_Invoice");
const { isVoucherValid, setVoucher } = require("./M_Voucher");

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

const checkStatus = async (resvRoomId) => {
  try {
    const exist = await prisma.resvRoom.findFirstOrThrow({ where: { id: resvRoomId }, select: { reservation: { select: { resvStatusId: true } } } })
    if (exist.reservation.resvStatusId === 2) {
      return await prisma.resvRoom.update({ where: { id: resvRoomId }, data: { deleted_at: generateDeleteDate("status6PM") } })
    } else return false
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const createNewResvRoom = async (id, data, user) => {
  let voucherMessage
  try {
    const reservation = await prisma.reservation.findFirst({ where: { id } })
    await isRoomAvailable({ arr: reservation.arrivalDate.toISOString(), dep: reservation.departureDate.toISOString() }, data.roomId)
    await isArrangementMatch(data.roomId, data.arrangmentCode)
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
        roomMaids: {
          connect: { id: roomMaid[0].RoomMaid[0].id }
        }
      }
    })
    await checkStatus(resvRoom.id)
    const voucher = await setVoucher(data.voucher, resvRoom.id, user.id)
    if (voucher === false) voucherMessage = "Voucher invalid"
    if (reservation.checkInDate != null) await addNewInvoiceFromArticle([], reservation.id, resvRoom.id)
    return { resvRoom, voucherMessage };
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect();
  }
}

module.exports = { createNewResvRoom, getAllRoomIdReservedByReserverId };