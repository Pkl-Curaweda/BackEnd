const { randomInt } = require("crypto");
const { prisma } = require("../../config");
const { faker } = require('@faker-js/faker');

const idCards = [
	{
		reservationId: 1,
        name: faker.person.firstName(),
        cardIdentifier: "KTP",
        cardId: randomInt(99999999).toString(),
		address: faker.location.nearbyGPSCoordinate().toString
	},
];

async function IdCardSeed(reservationId) {
	for (let idCard of idCards) {
		idCard.reservationId = reservationId
		await prisma.idCard.create({
			data: idCard
		});
	}
}
module.exports = { IdCardSeed };
