const jwt = require('jsonwebtoken')
const path = require('path');
const { CreateNewGuest, GenerateGuestQrCode, GetGuestById, GuestLogin, GetAllGuests } = require("../models/Authorization/M_Guest");
const { success, error } = require("../utils/response");

const PostNewGuest = async (req, res) => {
    const name = req.body.name;
    const contact = req.body.contact;
    const createGuest = await CreateNewGuest(name, contact);
    return success(res, 'User Created', createGuest)
}

const GetQRCode = async (req, res) => {
    const guestId = parseInt(req.params.id);
    const guestData = await GetGuestById(guestId)
    const generatedQR = await GenerateGuestQrCode(guestData);
    setTimeout(() => {
        return res.download(path.resolve(generatedQR))
    }, 100)
}

const GetAllGuest = async (req, res) => {
    const guests = await GetAllGuests();
    return success(res, 'Operation Success', guests)
}

const GetCurrentGuest = async (req, res) => {
    return success(res, 'Operation Success', req.user);
}

const PostLogin = async (req, res) => {
    try {
        const loginMethod = req.params.method;
        const loginData = loginMethod === "qr" ? req.query.encryptedData : req.body;

        const expires = new Date(Date.now() + 1000 * 3600 * 24 * 30) // Expires in 30 day
        const guestAndGeneratedToken = await GuestLogin(loginMethod, loginData);
        res.cookie('refresh_token', guestAndGeneratedToken.createdToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            expires
        });

        const storedSubject = {
            id: guestAndGeneratedToken.guest.id.toString(),
            username: guestAndGeneratedToken.guest.username.toString(),
            name: guestAndGeneratedToken.guest.name.toString(),
            roomId: guestAndGeneratedToken.reservedRoom
        }
        const accessToken = jwt.sign(storedSubject, process.env.SECRET_CODE, {
            expiresIn: '15m',
        });

        delete guestAndGeneratedToken.guest.password;
        return success(res, 'Login Success', { user: guestAndGeneratedToken.user, accessToken });
    } catch (err) {
        return error(res, err.message, 404)
    }
}

module.exports = { PostNewGuest, GetQRCode, PostLogin, GetCurrentGuest, GetAllGuest };