const { prisma } = require("../config");
const bcrypt = require("bcrypt");
const { faker } = require('@faker-js/faker');

const guests = [
  {
    username: faker.internet.userName(),
    password: "password",
    name: faker.person.firstName(),
    contact: faker.phone.number() ,
  },
];

async function guestSeed() {
  for (let guest of guests) {
    const existingGuest = await prisma.guest.findFirst({
			where: {
				username: guest.username,
			},
		});

		if (!existingGuest) {
			const salt = await bcrypt.genSalt();
			guest.password = await bcrypt.hash(guest.password, salt);
			await prisma.guest.create({
				data: guest,
			});
		};
  }
}

module.exports = { guestSeed };
