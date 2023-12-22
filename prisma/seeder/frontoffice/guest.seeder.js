const { prisma } = require("../config");
const bcrypt = require("bcrypt");
const { faker } = require('@faker-js/faker');
const { ReserverSeed } = require("./reservation/reserver.seeder");

const guests = {
	username: faker.internet.userName(),
	password: "password",
	name: faker.person.firstName(),
	contact: faker.phone.number(),
};

async function guestSeed() {
	const salt = await bcrypt.genSalt();
    guests.password = await bcrypt.hash(guests.password, salt);
	const { id } = await prisma.guest.upsert({
		where: { username: guests.username },
		update: guests,
		create: guests
	})
	const reserverId = await ReserverSeed(id)
	return reserverId
}

module.exports = { guestSeed };
