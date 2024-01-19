const { prisma } = require("../../config");
const { faker } = require('@faker-js/faker');

const rooms = [
  {
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
  let id = 1;
  for(room of rooms){
    const exist = await prisma.room.findFirst({ where: { id } })
    if(!exist){
      await prisma.room.create({ data: room })
    } 
    id++
  }
}

module.exports = { roomSeed };
