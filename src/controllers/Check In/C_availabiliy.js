const prisma = require ('prisma');
const { filterRoomAvailabiy } = require("../../models/Check In/M_availRoom");

const getFilterRoomAvail = async (req, res) => {
    const { roomType } = req.query;
    const { roomId } = req.query;
    const { bedSetup } = req.query;
    
    try {
        const avail = await filterRoomAvailabiy(roomType, roomId, bedSetup);
    
        if (avail.length == 0) {
            return res.status(404).json({ error: "Room Not Availabily" });
        }
        
        return res.json(avail);

    } catch (error) {
        console.log(error)
		res.status(500).json({ error: "Internal Server Error" });
    }

}

module.exports = {
    getFilterRoomAvail,
}