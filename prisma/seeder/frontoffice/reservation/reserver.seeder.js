const { randomInt } = require("crypto");
const { prisma } = require("../../config");

const reservers = {
	resourceName: 'Walk In',
	guestId: 1,
	created_at: new Date(),
	updated_at: new Date(),
};

async function ReserverSeed(guestId) {
	let resource = ['Individual Reservation', 'Walk In']
	reservers.resourceName = resource[randomInt(0, 1)]
	reservers.guestId = guestId
	const reserver  = await prisma.Reserver.create({
		data: reservers
	});
	return reserver.id
}

module.exports = { ReserverSeed };
