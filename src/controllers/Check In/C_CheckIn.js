const { getAllCheckIn, getChekInById } = require("../../models/Check In/M_CheckIn");

const getCheckIn = async (req, res) => {
    try {
        const data = await getAllCheckIn()
        res.status(200).json({
            data,
        });
    } catch (error) {
        console.log(error);
    }

};

const getCheckInId = async (req, res) => {
    try {
        const reservationId = req.params.id;
        const data = await getChekInById(parseInt(reservationId));
        res.status(200).json({
            data,
        });
    } catch (error) {
        console.log(error);
    }
}

module.exports = { getCheckIn, getCheckInId }