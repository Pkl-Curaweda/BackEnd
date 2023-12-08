const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError } = require("../../utils/helper");

const ChangeRoom = async (id, reservationId, body) => {
  try {
    const { roomId } = await prisma.resvRoom.findFirstOrThrow({
      where: { id, reservationId },
      select: { id: true, roomId: true }
    });

    console.log(roomId)

    const changeRoomLog = await prisma.roomChange.create({
      data: {
        roomFromId: roomId,
        roomToId: body.roomId,
        resvRoomId: id,
        note: body.note
      },
    });

    const updatedResvRoom = await prisma.resvRoom.update({
      where: { id },
      data: { roomId: body.roomId },
    });

    return { updatedResvRoom,  changeRoomLog};
  } catch (err) {
    ThrowError(err)
  }
}

module.exports = { ChangeRoom }