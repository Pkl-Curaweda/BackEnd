const { prisma } = require("../../config");

const serviceTypes = [
  {
    name: "Mini Market",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: "FnB",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: "Laundry",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

async function serviceTypeSeed() {
  for (let serviceType of serviceTypes) {
    await prisma.serviceType.create({
      data: serviceType,
    });
  }
}

module.exports = { serviceTypeSeed };
