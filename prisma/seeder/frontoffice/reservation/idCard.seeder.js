const { prisma } = require("../../config");

const idCards = [
	{
		reservationId: 1,
        name: "Akbar",
        cardIdentifier: "KTP",
        cardId: "2317381122",
		address: "Jl. Kalimantan 202"
	},
];

async function IdCardSeed() {
	for (let idCard of idCards) {
		await prisma.idCard.create({
			data: idCard
		});
	}
}
module.exports = { IdCardSeed };
