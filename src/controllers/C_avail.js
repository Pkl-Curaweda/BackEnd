const { findAvail } = require("../models/Room/M_avail");

const getAvail = async (req, res) => {
    const avail = await findAvail();

    res.status(200).json({ avail });
};

module.exports = { getAvail };