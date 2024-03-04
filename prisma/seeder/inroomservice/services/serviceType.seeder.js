const { prisma } = require("../../config");

const serviceTypes = [
  {
    name: "Mini Market",
    openHour: 7,
    closeHour: 22,
    picture:`${process.env.BASE_URL}/assets/profile-pict/1.png`,
    orderTrackId: 1,
    path: "/irs/minimarket",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: "Food And Beverage",
    openHour: 7,
    closeHour: 22,
    orderTrackId: 2,
    picture:`${process.env.BASE_URL}/assets/profile-pict/1.png`,
    path: "/irs/food-beverage",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: "Laundry",
    openHour: 7,
    closeHour: 22,
    orderTrackId: 3,
    picture:`${process.env.BASE_URL}/assets/profile-pict/1.png`,
    path: "/irs/laundry",
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
