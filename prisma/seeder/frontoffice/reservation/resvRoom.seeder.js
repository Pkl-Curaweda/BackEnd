const { randomInt } = require("crypto");
const { prisma } = require("../../config");
const { roomChangeSeed } = require("../roomChange.seeder");
const { invoiceSeeder } = require("../Article/invoice");
const { ResvPaymentSeed } = require("./resvPayment.seeder");

const resvRooms = {
	roomId: 101,
	reservationId: 1,
	roomMaidId: 2,
	arrangmentCodeId: "DLX-RB",
	created_at: new Date(),
	updated_at: new Date(),
};

async function ResvRoomSeed(reservationId) {
	resvRooms.reservationId = reservationId
	resvRooms.roomId = randomInt(101, 110);
	const rType = ['DLX', 'DLX', 'DLX', 'DLX', 'FML', 'FML', 'FML', 'STD', 'STD', 'STD']
	const rbRo = ['RB', 'RO']
	resvRooms.arrangmentCodeId = `${rType[resvRooms.roomId - 100]}-${rbRo[randomInt(0,  2)]}` 
	const resvRoom = await prisma.resvRoom.create({
		data: resvRooms,
	});
	await prisma.room.update({ where:{ id: resvRoom.roomId }, data: { occupied_status: true } })
	await roomChangeSeed(resvRoom.id)
	// await ResvPaymentSeed(resvRoom.id)
	// await invoiceSeeder(resvRoom.id)
}

module.exports = { ResvRoomSeed };
