const { prisma } = require("./config");
const { frontOfficeBatchSeed } = require("./frontoffice");
const { guestSeed } = require("./frontoffice/guest.seeder");
const { roleSeed } = require("./global/role.seeder");
const { userSeed } = require("./global/user.seeder");
const { paymentSeed } = require("./inroomservice/payment/payment.seeder");
const {
  paymentMethodSeed,
} = require("./inroomservice/payment/paymentMethod.seeder");
const { serviceBatchSeed } = require("./inroomservice/services");
const { productReqSeed } = require("./inroomservice/services/productReq.seeder");

async function main() {
  await guestSeed();

  /* user seeed */
  await roleSeed(); // important to seed role first before user
  await userSeed();
  /* user seeed end */

  /* service seeed */
  await serviceBatchSeed();
  /* service seeed end */

  /* payment seeed */
  await paymentMethodSeed(); // important to seed paymentMethod first before payment
  await paymentSeed();
  /* payment seeed end */

  /* productReq seeed */
  await productReqSeed();
  /* productReq seeed end */

  /* productReq seeed */
  await frontOfficeBatchSeed();
  /* productReq seeed end */

}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.log(err);
    await prisma.$disconnect();
    process.exit(1);
  });
