const { prisma } = require("../config");

const lostFounds = [
  {
    roomId: 101,
    picId: 2,
    location: "Lobby",
    image: "https://random.imagecdn.app/500/300",
    description: "Room cleaned thoroughly, ready for next guest.",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

async function lostFoundSeed() {
  for (let lostFound of lostFounds) {
    await prisma.lostFound.create({
      data: lostFound,
    });
  }
}

module.exports = { lostFoundSeed };
