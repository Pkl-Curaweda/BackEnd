const { prisma } = require("../config");

const guests = [
  {
    username: "John Doe",
    password: "password",
    name: "John Doe",
    email: "jhondoe@gmail.com",
    contact: "08123456789",
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
