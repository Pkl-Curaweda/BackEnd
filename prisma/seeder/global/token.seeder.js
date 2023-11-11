const { prisma } = require("../config");

const userTokens = [
  {
    refreshToken: "refreshToken3",
    userId: 1,
    expired_at: new Date(),
  },
];

const guestTokens = [
  {
    refreshToken: "refreshToken3",
    guestId: 1,
    expired_at: new Date(),
  },
];

async function tokenSeed() {
  for (let userToken of userTokens) {
    await prisma.userToken.create({
      data: userToken,
    });
  }

  for (let guestToken of guestTokens) {
    await prisma.guestToken.create({
      data: guestToken,
    });
  }
}

module.exports = { tokenSeed };
