const jwt = require('jsonwebtoken')
const path = require('path');
const { CreateNewGuest, GenerateGuestQrCode, GetGuestById, GuestLogin } = require("../models/Authorization/M_Guest");
const { success } = require("../utils/response");

const PostNewGuest = async (req, res) => {
    const body = req.body;
    const createGuest = await CreateNewGuest(body); 
    return createGuest;
}

const GetQRCode = async (req, res) => {
    const guestId = parseInt(req.params.id);
    const guestData = await GetGuestById(guestId)
    const generatedQR = await GenerateGuestQrCode(guestData);
    setTimeout(() => {
        return res.download(path.resolve(generatedQR))
    }, 100)
}

const PostLoginQR = async (req, res) => {
    const encryptedData = req.query.encryptedData;
    const guestAndGeneratedToken = await GuestLogin(encryptedData);
    const storedCookie = {
        refreshToken: guestAndGeneratedToken.createdToken,
        roomId: guestAndGeneratedToken.guest
    }
    const expires = new Date(Date.now() + 1000 * 3600 * 24 * 30) // Expires in 30 days
    res.cookie('refresh_token', guestAndGeneratedToken.createdToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires
    });
    const accessToken = jwt.sign({}, process.env.SECRET_CODE, {
        expiresIn: '15m',
        subject: guestAndGeneratedToken.guest.id.toString()
    });

    delete guestAndGeneratedToken.guest.password;
    return success(res, 'Login Success', { user: guestAndGeneratedToken.user, accessToken });
}

module.exports = { PostNewGuest, GetQRCode, PostLoginQR };