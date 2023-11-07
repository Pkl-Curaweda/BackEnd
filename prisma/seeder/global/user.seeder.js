const { prisma } = require("../config");
const bcrypt = require("bcrypt");

const users = [
	{
		name: "Admin",
		gender: "MALE",
		phone: "08123456789",
		picture: "https://i.pravatar.cc/300",
		email: "admindummy@gmail.com",
		nik: "1234567890123456",
		birthday: new Date("1990-01-01"),
		username: "admin",
		password: "password",
		roleId: 2,
		created_at: new Date(),
		updated_at: new Date(),
	},
];

async function userSeed() {
	for (let user of users) {
		const existingUser = await prisma.user.findUnique({
			where: {
				email: user.email,
			},
		});

		if (!existingUser) {
			const salt = await bcrypt.genSalt();
			user.password = await bcrypt.hash(user.password, salt);
			await prisma.user.create({
				data: user,
			});
		};
	}
}

// async function userSeed() {
// 	for (let user of users) {
// 		await prisma.user.create({
// 			data: user,
// 		});
// 	}
// }

module.exports = { userSeed };
