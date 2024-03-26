const { prisma } = require("./config");
const { frontOfficeBatchSeed } = require("./frontoffice");
const { roleSeed } = require("./global/role.seeder");
const { tokenSeed } = require("./global/token.seeder");
const { userSeed } = require("./global/user.seeder");
const { inRoomServiceBatchSeed } = require("./inroomservice");
const { houseKeepingSeed } = require("./housekeeping");
const { departmentSeed } = require("./housekeeping/department.seeder");
const { roomMaidSeed } = require("./housekeeping/roomMaid.seeder");
const { roomBatchSeed } = require("./frontoffice/room");
const { articleTypeSeed } = require("./frontoffice/Article/articleType.seeder");
const { ShiftSeed } = require("./housekeeping/shift.seeder");
const { NotificationSeed } = require("./global/notification.seeder");
const { ThrowError, PrismaDisconnect } = require("../../src/utils/helper");
const { VoucherSeed } = require("./frontoffice/reservation/voucher.seeder");
const { specialTreatmentSeed } = require("./frontoffice/specialTreatment.seeder");
const { ResvStatusSeed } = require("./frontoffice/reservation/resvStatus.seeder");
const { orderTrackSeed } = require("./inroomservice/frontOffice (Develop)/orderTrack");
const { paymentMethodSeed } = require("./inroomservice/payment/paymentMethod.seeder");
const { serviceBatchSeed } = require("./inroomservice/services");
const { StockSeed } = require("./housekeeping/stock.seeder");
const { taskTypeSeed } = require("./housekeeping/taskType.seeder");


async function main() {
  /* user seeed */
  await roleSeed(); // important to seed role first before user
  await userSeed();
  await VoucherSeed()
  await departmentSeed()
  await ShiftSeed();
  await articleTypeSeed()
  await roomBatchSeed()
  await specialTreatmentSeed();
  await ResvStatusSeed(); // #1
  await NotificationSeed()
  await roomMaidSeed()
  await orderTrackSeed()
  await paymentMethodSeed(); // important to seed paymentMethod first before payment
  await serviceBatchSeed();
  await StockSeed();
  await taskTypeSeed();

  
  /* front office seeed */
  // await frontOfficeBatchSeed();
  /* front office seeed end */
  
  /* token seeed */
  // await tokenSeed(); // important to seed token after user

  /* user seeed end */

  /* in room service seeed */
  // await inRoomServiceBatchSeed();
  /* in room service end */

  /*House Keeping seed */
  // await houseKeepingSeed();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    ThrowError(err)
    await PrismaDisconnect()
    process.exit(1);
  });
