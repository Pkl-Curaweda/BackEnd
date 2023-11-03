const { prisma } = require("../../config");

const rooms = [
  {
    room_type: 'STANDARD',
    room_image: "https://i.pravatar.cc/300",
    room_status: 1,
    room_code: 1,
    category: "well",
    floor: 3,
    i: 2,
    occupied_status: true,
    overlook: "well",
    description: "kamar well",
    bed_setup: "well",
    connecting: "well",
    room_capacity_id: 2,
    rate_code: 5.0
  },
  {
    room_type: 'STANDARD',
    room_image: "https://i.pravatar.cc/300",
    room_status: 1,
    room_code: 1,
    category: "well",
    floor: 3,
    i: 2,
    occupied_status: true,
    overlook: "well",
    description: "kamar well",
    bed_setup: "well",
    connecting: "well",
    room_capacity_id: 2,
    rate_code: 5.0
  }
];

async function roomSeed() {
  for (let room of rooms) {
    await prisma.room.create({
      data: room,
    });
  }
}

module.exports = { roomSeed };
