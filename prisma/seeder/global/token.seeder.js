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
		await prisma.userToken.update({
			where: { refreshToken: "refreshToken1" },
			data: userToken,
		});
	}

	for (let guestToken of guestTokens) {
		await prisma.guestToken.update({
			where: { refreshToken: "refreshToken2" },
			data: guestToken,
		});
	}
}

module.exports = { tokenSeed };
