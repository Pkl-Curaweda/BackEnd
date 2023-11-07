const { prisma } = require("../config");

const discrepancy = [
	{
		reservationId: 1,
		roomId: 1,
		foAdult: 1,
		foChild: 1,
		hkAdult: 1,
		hkChild: 1,
		hkStatus: 1,
		foStatus: 1,
		checker: "done bang",
		explanation: "very good very well",
		commentId: 1,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

async function DiscrepancySeed() {
	for (let Discrepancy of discrepancy) {
		await prisma.discrepancy.create({
			data: Discrepancy,
		});
	}
}

module.exports = { DiscrepancySeed };
