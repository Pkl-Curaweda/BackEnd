const { randomInt } = require("crypto");
const { prisma } = require("../../config");
const { roomChangeSeed } = require("../roomChange.seeder");

const resvRooms = {
	roomId: 1,
	reservationId: 1,
	voucherNo: 21321,
	arrangmentCodeId: "DLX-RB",
	created_at: new Date(),
	updated_at: new Date(),
};

async function ResvRoomSeed(reservationId) {
	resvRooms.reservationId = reservationId
	resvRooms.roomId = randomInt(10),
	resvRooms.voucherNo = randomInt(100)
	const resvRoom = await prisma.resvRoom.create({
		data: resvRooms,
	});
	await prisma.room.update({ where:{ id: resvRoom.roomId }, data: { occupied_status: true } })
	await roomChangeSeed(resvRoom.id)
}

module.exports = { ResvRoomSeed };
