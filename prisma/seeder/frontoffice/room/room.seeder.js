const { prisma } = require("../../config");
const { faker } = require('@faker-js/faker');

const rooms = [
  {
    id: 101,
    roomType: "DELUXE",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
    bedSetup: "KING",
    rate: "DLX-RO"
  },
  {
    id: 102,
    roomType: "DELUXE",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),    
    bedSetup: "KING",
    rate: "DLX-RO"
  },
  {
    id: 103,
    roomType: "DELUXE",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),    
    bedSetup: "KING",
    rate: "DLX-RO"
  },
  {
    id: 104,
    roomType: "DELUXE",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
    bedSetup: "KING",
    rate: "DLX-RO"
  },
  {
    id: 105,
    roomType: "FAMILY",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
    bedSetup: "TWIN",
    rate: "FML-RO"
  },
  {
    id: 106,
    roomType: "FAMILY",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
    bedSetup: "TWIN",
    rate: "FML-RO"
  },
  {
    id: 107,
    roomType: "FAMILY",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
    bedSetup: "TWIN",
    rate: "FML-RO"
  },
  {
    id: 108,
    roomType: "STANDARD",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
    bedSetup: "SINGLE",
    rate: "STD-RO"
  },
  {
    id: 109,
    roomType: "STANDARD",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
    bedSetup: "SINGLE",
    rate: "STD-RO"
  },
  {
    id: 110,
    roomType: "STANDARD",
    roomImage: "http://localhost:3000/assets/room/room_1.jpg",
    roomStatusId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
    bedSetup: "SINGLE",
    rate: "STD-RO"
  },
];

async function roomSeed() {
  for(let room of rooms){
    await prisma.room.upsert({
      where: { id: room.id },
      update: { ...room },
      create: { ...room }
    })
  }
}

module.exports = { roomSeed };
