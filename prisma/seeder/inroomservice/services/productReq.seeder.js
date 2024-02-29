const { prisma } = require("../../config");

const productReqs = [
  {
    user: { connect: { id: 1 } },
    service:  { connect: { id: 1 } }  
  },
  {
    user: { connect: { id: 2 } },
    service:  { connect: { id: 2 } }  
  },
];

async function productReqSeed() {
  for (let productReq of productReqs) {
    await prisma.productReq.create({
      data: productReq,
    });
  }
}

module.exports = { productReqSeed };
