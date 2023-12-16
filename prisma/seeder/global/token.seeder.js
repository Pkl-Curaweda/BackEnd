const { prisma } = require("../config");
const { generateId } = require("../inroomservice/frontOffice (Develop)/uniqueHandler");

const userTokens = [
	{
		refreshToken: generateId(),
		userId: 1,
		expired_at: new Date(),
	},
];

const guestTokens = [
	{
		refreshToken: generateId(),
		guestId: 1,
		expired_at: new Date(),
	},
];

async function tokenSeed() {
	for (let userToken of userTokens) {
		userToken.refreshToken = generateId()
		await prisma.userToken.create({
			data: userToken,
		});
	}

	for (let guestToken of guestTokens) {
		guestToken.refreshToken = generateId()
		await prisma.guestToken.create({
			data: guestToken,
		});
	}
}

module.exports = { tokenSeed };
