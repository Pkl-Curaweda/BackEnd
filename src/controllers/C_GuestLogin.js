const { CreateNewGuest, GenerateGuestQrCode, GetGuestById } = require("../models/M_Guest");

const PostNewGuest = async (req, res) => {
    const body = req.body;
    const createGuest = await CreateNewGuest(body); 
    return createGuest;
}

const GetQRCode = async (req, res) => {
    const guestId = parseInt(req.params.id);
    const guestData = await GetGuestById(guestId)
    const generateQr = GenerateGuestQrCode(guestData);
    return generateQr;
}

module.exports = { PostNewGuest, GetQRCode };