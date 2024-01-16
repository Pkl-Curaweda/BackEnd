const { prisma } = require("./config");
const { frontOfficeBatchSeed } = require("./frontoffice");
const { roleSeed } = require("./global/role.seeder");
const { tokenSeed } = require("./global/token.seeder");
const { userSeed } = require("./global/user.seeder");
const { inRoomServiceBatchSeed } = require("./inroomservice");
const { houseKeepingSeed } = require("./housekeeping");
const { departmentSeed } = require("./housekeeping/department.seeder");
const { articleTypeSeed } = require("./global/articleType.seeder");
const { resvArticleSeeder } = require("./global/resvArticle.seeder");
const { roomMaidSeed } = require("./housekeeping/roomMaid.seeder");
const { roomBatchSeed } = require("./frontoffice/room");

async function main() {
  /* user seeed */
  await roleSeed(); // important to seed role first before user
  await userSeed();
  await articleTypeSeed()
  await departmentSeed()
  await roomBatchSeed()
  await roomMaidSeed()
  
  /* front office seeed */
  await frontOfficeBatchSeed();
  await resvArticleSeeder()
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
    console.log(err);
    await prisma.$disconnect();
    process.exit(1);
  });
