const { transactionSeeder } = require("./transaction.seeder")

const frontOfficeDevelopBatchSeed = async () => {
    await transactionSeeder()
}

module.exports = { frontOfficeDevelopBatchSeed }