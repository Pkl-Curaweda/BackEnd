const { randomInt } = require("crypto");
const { prisma } = require("../config");

const roomChanges =  {
  roomFromId: 103,
  roomToId: 101,
  resvRoomId: 1,
  reason: 'room change note here...'
};

async function roomChangeSeed(resvRoomId) {
  roomChanges.resvRoomId = resvRoomId
  roomChanges.roomFromId = randomInt(101, 110);
  roomChanges.roomToId = randomInt(101, 110),
  await prisma.roomChange.create({ data: roomChanges });
}

module.exports = { roomChangeSeed };
