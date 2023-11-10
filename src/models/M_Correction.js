const prisma = require("../db/index");

const findData = async () => {
	const sortingPage = await prisma.reservation.findMany();
	return sortingPage;
};

module.exports = { findData };
