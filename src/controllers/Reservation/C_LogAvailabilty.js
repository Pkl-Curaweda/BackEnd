const { getLogAvailabilityData } = require("../../models/Reservation/M_LogAvailability");
const { success } = require("../../utils/response");

const getLogAvailability = async (req, res) => {
    const logAvailability = await getLogAvailabilityData();
    return success(res, 'Operation Success', logAvailability);
}

module.exports = { getLogAvailability }