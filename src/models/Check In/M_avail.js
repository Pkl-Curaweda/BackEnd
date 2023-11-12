const { roomClient } = require("../Helpers/Config/Front Office/RoomConfig");

const findAvail = async () => {
    const avail = await roomClient.findMany();
    return avail;
};

module.exports = { findAvail };