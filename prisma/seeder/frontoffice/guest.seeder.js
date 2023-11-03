const { prisma } = require("../config");

const guests = [
  {
    username: "John Doe",
    password: "password",
  },
];

async function guestSeed() {
  for (let guest of guests) {
    await prisma.guest.create({
      data: guest,
    });
  }
}

module.exports = { guestSeed };
