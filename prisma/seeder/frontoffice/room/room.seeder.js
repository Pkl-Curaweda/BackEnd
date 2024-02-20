const { prisma } = require("../../config");
const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker");
const { randomInt } = require("crypto");


const rooms = [
  {
    id: 0,
    roomTypeId: "REMOVED",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
  },
  {
    id: 101,
    roomTypeId: "DLX",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
  },
  {
    id: 102,
    roomTypeId: "DLX",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
  },
  {
    id: 103,
    roomTypeId: "DLX",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
  },
  {
    id: 104,
    roomTypeId: "DLX",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
  },
  {
    id: 105,
    roomTypeId: "FML",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
  },
  {
    id: 106,
    roomTypeId: "FML",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
  },
  {
    id: 107,
    roomTypeId: "FML",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
  },
  {
    id: 108,
    roomTypeId: "STD",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
  },
  {
    id: 109,
    roomTypeId: "STD",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
  },
  {
    id: 110,
    roomTypeId: "STD",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
  },
];

async function roomSeed() {
  for (let room of rooms) {
    await prisma.room.upsert({
      where: { id: room.id },
      update: { ...room },
      create: {
        ...room, User: {
          create: {
            name: faker.person.firstName(),
            gender: "MALE",
            phone: "",
            picture: `${process.env.BASE_URL}/assets/room_1.jpg`,
            email: `room${room.id}`,
            nik: "",
            birthday: new Date(faker.date.birthdate()),
            username: `Kamar ${room.id}`,
            password: "password",
            roleId: 8,
          }
        }
      }
    })
  }
}

module.exports = { roomSeed };
