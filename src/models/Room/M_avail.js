const roomClient = require("./config");

const findAvail = async () => {
    const avail = await roomClient.findMany();
    return avail;
};

module.exports = { findAvail };