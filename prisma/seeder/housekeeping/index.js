const { cleanRoomSeed } = require("./cleanRoom.seeder");
const { departmentSeed } = require("./department.seeder");
const { dirtyRoomSeed } = require("./dirtyRoom.seeder");
const { extraBedSeed } = require("./extraBed.seeder");
const { lostFoundSeed } = require("./lostFound.seeder");
const { oooRoomSeed } = require("./oooRoom.seeder");
const { roomMaidSeed } = require("./roomMaid.seeder");

async function houseKeepingSeed() {
  await cleanRoomSeed();
  await dirtyRoomSeed();
  await extraBedSeed();
  await oooRoomSeed();
  await lostFoundSeed();
}

module.exports = { houseKeepingSeed };
