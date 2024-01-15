const { prisma } = require("../config");

const lostFounds = [
  {
    roomId: 1,
    picId: 2,
    userId: 1,
    time: "03:04",
    reportedDate: new Date(),
    location: "Lobby",
    phoneNumber: "+6289900523342",
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
