const { prisma } = require("../../config");

const resvStatus = [
	{
		desc: "guarented",
		hexCode: "#FFFFFF",
		created_at: new Date(),
		updated_at: new Date(),
	},
];
async function ResvStatusSeed() {
	for (let ResvStatus of resvStatus) {
		await prisma.ResvStatus.create({
			data: ResvStatus,
		});
	}
}

module.exports = { ResvStatusSeed };
