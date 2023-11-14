const { logAvail } = require("../Helpers/Config/Front Office/logAvailabilityConfig");

const findAvail = async () => {
    const avail = await logAvail.findMany({
        select: {
            availBeforeAllotment: true,
            allotment: true,
            availAfterAllotment: true,
            totalOverbooking: true,
            ooo: true,
            tentative: true,
        }
    })
    return avail;
};

module.exports = { findAvail };