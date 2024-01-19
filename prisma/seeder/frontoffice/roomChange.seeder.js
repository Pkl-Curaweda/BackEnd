const { randomInt } = require("crypto");
const { prisma } = require("../config");

const roomChanges =  {
  roomFromId: 3,
  roomToId: 1,
  resvRoomId: 1,
  reason: 'room change note here...'
};

async function roomChangeSeed(resvRoomId) {
  roomChanges.resvRoomId = resvRoomId
  roomChanges.roomFromId = randomInt(1, 10);
  roomChanges.roomToId = randomInt(1, 10),
  await prisma.roomChange.create({ data: roomChanges });
}

module.exports = { roomChangeSeed };
