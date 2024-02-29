const { serviceBatchSeed } = require("./services");
const { paymentMethodSeed } = require("./payment/paymentMethod.seeder");
const { paymentSeed } = require("./payment/payment.seeder");
const { productReqSeed } = require("./services/productReq.seeder");
const { frontOfficeDevelopBatchSeed } = require("./frontOffice (Develop)");
const { orderTrackSeed } = require("./frontOffice (Develop)/orderTrack");
async function inRoomServiceBatchSeed() {
  /* service seeed */
  await orderTrackSeed()
  await serviceBatchSeed();
  /* service seeed end */

  /* payment seeed */
  await paymentMethodSeed(); // important to seed paymentMethod first before payment
  await paymentSeed();
  /* payment seeed end */
  await frontOfficeDevelopBatchSeed()

}

module.exports = { inRoomServiceBatchSeed };
 