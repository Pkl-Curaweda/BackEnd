const jwt = require('jsonwebtoken')
const path = require('path');
const { CreateNewGuest, GetGuestById, GuestLogin, GetAllGuests, CreateGuestQrCode } = require("../models/Authorization/M_Guest");
const { success, error } = require("../utils/response");

const GetQRCode = async (req, res) => {
    try {
        const guestId = parseInt(req.params.id);
        const guestData = await GetGuestById(guestId)
        const generatedQR = await CreateGuestQrCode(guestData);
        setTimeout(() => {
            return res.download(path.resolve(generatedQR))
        }, 100)
    } catch (err) {
        return error(res, err.message)
    }
}

const GetAllGuest = async (req, res) => {
    try {
        const guests = await GetAllGuests();
        return success(res, 'Operation Success', guests)
    } catch (err) {
        return error(res, err.message)
    }
}

const GetCurrentGuest = async (req, res) => {
    return success(res, 'Operation Success', req.user);
}

const PostLogin = async (req, res) => {
    try {
        const loginMethod = req.params.method;
        const loginData = loginMethod === "qr" ? req.params.encrypt : req.body;

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

const PostNewGuest = async (req, res) => {
    try {
        const name = req.body.name;
        const contact = req.body.contact;
        const createGuest = await CreateNewGuest(name, contact);
        return success(res, 'User Created', createGuest)
    } catch (err) {
        return error(res, err.meesage)
    }
}

module.exports = { PostNewGuest, GetQRCode, PostLogin, GetCurrentGuest, GetAllGuest };