const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError } = require("../../utils/helper");

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
        note: body.note,
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

module.exports = { ChangeRoom };
