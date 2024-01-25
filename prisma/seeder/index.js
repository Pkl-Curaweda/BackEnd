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


async function main() {
  /* user seeed */
  await roleSeed(); // important to seed role first before user
  await userSeed();
  await departmentSeed()
  await ShiftSeed();
  await articleTypeSeed()
  await roomBatchSeed()
  await NotificationSeed()
  await roomMaidSeed()
  
  /* front office seeed */
  await frontOfficeBatchSeed();
  /* front office seeed end */
  
  /* token seeed */
  await tokenSeed(); // important to seed token after user

  /* user seeed end */

  /* in room service seeed */
  await inRoomServiceBatchSeed();
  /* in room service end */

  /*House Keeping seed */
  await houseKeepingSeed();
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
