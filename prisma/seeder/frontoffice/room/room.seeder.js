const { prisma } = require("../../config");
const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker");
const { randomInt } = require("crypto");
const { generateQrRoom } = require("../../../../src/models/House Keeping/M_Room");
const { splitDateTime } = require("../../../../src/utils/helper");


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
    const salt = await bcrypt.genSalt()
    const password = await bcrypt.hash(process.env.ROOM_PASS, salt)
    const createdRoom = await prisma.room.upsert({
      where: { id: room.id },
      update: { ...room },
      create: {
        ...room, User: {
          create: {
            name: "Room",
            gender: "MALE",
            phone: "",
            canLogin: false,
            picture: `${process.env.BASE_URL}/assets/room/room_1.jpg`,
            email: `room${room.id}${process.env.EMAIL}`,
            nik: "",
            birthday: splitDateTime(new Date().toISOString()).date,
            username: `Kamar ${room.id}`,
            password,
            roleId: 8,
          }
        }
      }, include: { User: true }
    })
    await generateQrRoom(createdRoom.User[0].email, process.env.ROOM_PASS)
  }
}

module.exports = { roomSeed };
