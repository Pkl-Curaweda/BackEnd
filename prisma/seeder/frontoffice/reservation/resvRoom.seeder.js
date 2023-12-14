const { randomInt } = require("crypto");
const { prisma } = require("../../config");

const resvRoom = [
	{
		roomId: 1,
		reservationId: 1,
		voucherNo: randomInt(100),
		arrangmentCodeId: "DLX-RB",
		created_at: new Date(),
		updated_at: new Date(),
	},
];
async function ResvRoomSeed() {
	for (let ResvRoom of resvRoom) {
		await prisma.resvRoom.create({
			data: ResvRoom,
		});
	}
}

module.exports = { ResvRoomSeed };
