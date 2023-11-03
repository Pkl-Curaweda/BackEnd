const { prisma } = require("./config");
const { guestSeed } = require("./frontoffice/guest.seeder");
const { roleSeed } = require("./global/role.seeder");
const { userSeed } = require("./global/user.seeder");
const { serviceBatchSeed } = require("./inroomservice/services");

async function main() {
  await guestSeed();

  /* user seeed */
  await roleSeed(); // important to seed role first before user
  await userSeed();
  /* user seeed end */

  /* service seeed */
  await serviceBatchSeed();
  /* service seeed end */
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
