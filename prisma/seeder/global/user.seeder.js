const { prisma } = require("../config");
const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker");
const { randomInt } = require("crypto");

const users = [

  //! ADMIN
  {
    name: "Admin",
    gender: "MALE",
    phone: "08123456789",
    picture: "https://i.pravatar.cc/300",
    email: "admin1@gmail.com",
    nik: "1234567890123456",
    birthday: new Date("1990-01-01"),
    username: faker.internet.userName(),
    password: "password",
    roleId: 2,
    created_at: new Date(),
    updated_at: new Date(),
  },

  //! ROOM BOY
  {
    name: faker.person.firstName(),
    gender: "MALE",
    phone: "08123456789",
    picture: faker.image.avatarGitHub(),
    email: "roomboy1@gmail.com",
    nik: randomInt(999999999).toString(),
    birthday: new Date(faker.date.birthdate()),
    username: faker.internet.userName(),
    password: "password",
    roleId: 3,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: faker.person.firstName(),
    gender: "MALE",
    phone: "083424234578",
    picture: faker.image.avatarGitHub(),
    email: "roomboy2@gmail.com",
    nik: randomInt(999999999).toString(),
    birthday: new Date(faker.date.birthdate()),
    username: faker.internet.userName(),
    password: "password",
    roleId: 3,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: faker.person.firstName(),
    gender: "FEMALE",
    phone: "083424234578",
    picture: faker.image.avatarGitHub(),
    email: "roomboy3@gmail.com",
    nik: randomInt(999999999).toString(),
    birthday: new Date(faker.date.birthdate()),
    username: faker.internet.userName(),
    password: "password",
    roleId: 3,
    created_at: new Date(),
    updated_at: new Date(),
  },

  //! SUPERVISOR
  {
    name: faker.person.firstName(),
    gender: "MALE",
    phone: "0834325251",
    picture: faker.image.avatarGitHub(),
    email: "supervisor1@gmail.com",
    nik: randomInt(999999999).toString(),
    birthday: new Date(faker.date.birthdate()),
    username: faker.internet.userName(),
    password: "password",
    roleId: 5,
    created_at: new Date(),
    updated_at: new Date(),
  }
];

async function userSeed() {
  for (let user of users) {
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);
    await prisma.user.upsert({
      where: { email: user.email },
      create: user,
      update: user,
    });
  }
}

module.exports = { userSeed };
