const { orderSeeder } = require("./order.seeder")

const frontOfficeDevelopBatchSeed = async () => {
    await orderSeeder();
}

module.exports = { frontOfficeDevelopBatchSeed }