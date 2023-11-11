const { orderSeeder } = require("./order.seeder")
const { orderDetailSeeder } = require("./orderDetails.seeder")
const { transactionSeeder } = require("./transaction.seeder")

const frontOfficeDevelopBatchSeed = async () => {
    await transactionSeeder(),
    await orderSeeder(),
    await orderDetailSeeder()

}

module.exports = { frontOfficeDevelopBatchSeed }