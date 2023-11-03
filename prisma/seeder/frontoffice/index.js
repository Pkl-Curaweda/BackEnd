const { guestSeed } = require("./guest.seeder");
const { roomSeed } = require("./room.seeder");
const { roomFacilitySeed } = require("./roomFacility.seeder");

async function frontOfficeBatchSeed(){
    // the order of seeding is important
    await guestSeed();
    await roomSeed();
    await roomFacilitySeed();
}

module.exports = { frontOfficeBatchSeed }