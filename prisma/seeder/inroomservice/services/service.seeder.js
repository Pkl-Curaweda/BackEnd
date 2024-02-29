const { prisma } = require("../../config");

const services = [
  {
    userId: 1,
    name: "Betadine Wound",
    price: 8500,
    desc: "5ml",
    picture: "https://i.pravatar.cc/300",
    serviceTypeId: 1,
    subTypeId: 4,
    approved: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    userId: 1,
    name: "Biore Liquid Soap",
    price: 8500,
    desc: "5ml",
    picture: "https://i.pravatar.cc/300",
    serviceTypeId: 1,
    subTypeId: 4,
    approved: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    userId: 1,
    name: "Ayam Taliwang",
    price: 8500,
    desc: "5ml",
    picture: "https://i.pravatar.cc/300",
    serviceTypeId: 2,
    subTypeId: 4,
    approved: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    userId: 1,
    name: "Bebek Goreng Surabaya",
    price: 8500,
    desc: "5ml",
    approved: true,
    picture: "https://i.pravatar.cc/300",
    serviceTypeId: 2,
    subTypeId: 4,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    userId: 1,
    name: "Overall/Terusan",
    price: 8500,
    desc: "5ml",
    approved: true,
    picture: "https://i.pravatar.cc/300",
    serviceTypeId: 3,
    subTypeId: 4,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    userId: 1,
    name: "Polo/T-Shirt",
    price: 8500,
    desc: "5ml",
    approved: true,
    picture: "https://i.pravatar.cc/300",
    serviceTypeId: 3,
    subTypeId: 4,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

async function serviceSeed() {
  for (let service of services) {
    await prisma.service.create({
      data: service,
    });
  }
}

module.exports = { serviceSeed };
