const { prisma } = require("../../config");
const { faker } = require('@faker-js/faker');

const rooms = [
  {
    roomType: "DELUXE",
    roomImage: "https://i.pravatar.cc/300",
    roomStatusId: 1,
    roomCapacityId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
    bedSetup: "KING",
    rate: "DLX-RO"
  },
  {
    roomType: "DELUXE",
    roomImage: "https://i.pravatar.cc/301",
    roomStatusId: 1,
    roomCapacityId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),    
    bedSetup: "KING",
    rate: "DLX-RO"
  },
  {
    roomType: "DELUXE",
    roomImage: "https://i.pravatar.cc/302",
    roomStatusId: 1,
    roomCapacityId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),    
    bedSetup: "KING",
    rate: "DLX-RO"
  },
  {
    roomType: "DELUXE",
    roomImage: "https://i.pravatar.cc/303",
    roomStatusId: 1,
    roomCapacityId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
    bedSetup: "KING",
    rate: "DLX-RO"
  },
  {
    roomType: "FAMILY",
    roomImage: "https://i.pravatar.cc/304",
    roomStatusId: 1,
    roomCapacityId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
    bedSetup: "TWIN",
    rate: "FML-RO"
  },
  {
    roomType: "FAMILY",
    roomImage: "https://i.pravatar.cc/305",
    roomStatusId: 1,
    roomCapacityId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
    bedSetup: "TWIN",
    rate: "FML-RO"
  },
  {
    roomType: "FAMILY",
    roomImage: "https://i.pravatar.cc/306",
    roomStatusId: 1,
    roomCapacityId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
    bedSetup: "TWIN",
    rate: "FML-RO"
  },
  {
    roomType: "STANDARD",
    roomImage: "https://i.pravatar.cc/307",
    roomStatusId: 1,
    roomCapacityId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
    bedSetup: "SINGLE",
    rate: "STD-RO"
  },
  {
    roomType: "STANDARD",
    roomImage: "https://i.pravatar.cc/308",
    roomStatusId: 1,
    roomCapacityId: 1,
    floor: 1,
    occupied_status: false,
    description: faker.person.bio(),
    bedSetup: "SINGLE",
    rate: "STD-RO"
  },
  {
    roomType: "STANDARD",
    roomImage: "https://i.pravatar.cc/309",
    roomStatusId: 1,
    roomCapacityId: 1,
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
