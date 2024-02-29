const { orderSeeder } = require("./order.seeder");
const { orderTrackSeed } = require("./orderTrack");

const frontOfficeDevelopBatchSeed = async () => {
    await orderSeeder();
}

module.exports = { frontOfficeDevelopBatchSeed }