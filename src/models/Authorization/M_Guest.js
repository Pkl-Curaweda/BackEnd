const qr = require("qrcode");
const fs = require('fs');
const bcrypt = require("bcrypt")
const { guestClient } = require("../Helpers/Config/Front Office/GuestConfig");
const { PrismaDisconnect } = require("../Helpers/DisconnectPrisma");
const { ThrowError } = require("../Helpers/ThrowError")
const { encrypt, decrypt } = require("../../utils/encryption");
const { CreateAndAssignToken } = require("./M_Token");
const { getAllRoomIdReservedByReserverId } = require("../Reservation/M_ResvRoom");

const CreateNewGuest = async (data) => {
    try {
        const salt = await bcrypt.genSalt();
        data.password = await bcrypt.hash(data.password, salt)
        const userExist = await guestClient.findUnique({ where: { username: data.username } });
        if (!userExist) {
            const guest = await guestClient.create({ data })           
            return guest;
        }
        throw Error("Username already taken");
    } catch (err) {
        ThrowError(err);
    } finally {
        await PrismaDisconnect();
    }
}

const GuestLogin = async (method, data) => {
    try {
        if(method === "qr"){
            data = decrypt(data);
            data = JSON.parse(data);
        }
        const guest = await guestClient.findFirst({
            where: { username: data.username },
            include: { Reserver: true }
        })
        if (!guest) throw Error("Guest Not Found");
        const auth = await bcrypt.compare(data.password, guest.password);
        if (!auth) throw Error("Wrong Password");
        const reservedRoom = await getAllRoomIdReservedByReserverId(guest.Reserver.id);
        const createdToken = await CreateAndAssignToken("guest", guest);
        return {
            guest, createdToken, reservedRoom
        }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

const GenerateGuestQrCode = async (guestData) => {
    const storedData = {
        username: guestData.username,
        password: "password"
    }
    const path = `${process.env.QR_PATH}QR-${guestData.username}.png`;
    if (!fs.existsSync(path)) {
        const stringfyData = JSON.stringify(storedData);
        const encryptedData = encrypt(stringfyData);
        const storedQR = "http://localhost:3000/auth/guest/login/qr?encryptedData=" + encryptedData;
        qr.toFile(path, storedQR, (err) => {
            if (err) console.log(err);
        })
    }
    return path;
}

const GetGuestById = async (id) => {
    try {
        const guest = await guestClient.findFirst({ where: { id } });
        return guest;
    } catch (err) {
        ThrowError(err);
    } finally {
        await PrismaDisconnect();
    }
}

const GetAllGuests = async () => {
    try{
        const guests = await guestClient.findMany({ select: { username: true, name: true, contact: true }});
        return guests;
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}

const DeleteGuestById = async (id) => {
    try {
        const deletedGuest = await guestClient.delete({ where: { id } });
        return deletedGuest;
    } catch (err) {
        ThrowError(err);
    } finally {
        await PrismaDisconnect(); p5
    }
}

module.exports = { CreateNewGuest, GenerateGuestQrCode, GetGuestById, DeleteGuestById, GuestLogin, GetAllGuests  };