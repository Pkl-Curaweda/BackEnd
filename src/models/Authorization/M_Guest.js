const qr = require("qrcode");
const fs = require('fs');
const bcrypt = require("bcrypt")
const { guestClient } = require("../Helpers/Config/Front Office/GuestConfig");
const { PrismaDisconnect } = require("../Helpers/DisconnectPrisma");
const { ThrowError } = require("../Helpers/ThrowError")
const { encrypt, decrypt } = require("../../utils/encryption");
const { CreateAndAssignToken } = require("./M_Token");
const { getAllRoomIdReservedByReserverId } = require("../Reservation/M_ResvRoom");
const { generateRandomString, generateStringRandomizer } = require("../Helpers/generateFunction");

const generateUsernameAndPassword = async (guestName) => {
    try{
        let username, tokenExist;
        console.log(guestName)
        guestName = guestName.split(' ')[0];
        do{
            username = generateStringRandomizer(guestName)
            usernameExist = await guestClient.findUnique({ where: { username }})
        }while(usernameExist)
        const password = generateRandomString(8);
        return { username, password } 
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect();
    }
}

const CreateNewGuest = async (name, contact) => {
    try {
        const usernameAndPassword = await generateUsernameAndPassword(name);
        console.log(usernameAndPassword)
        const salt = await bcrypt.genSalt();
        const realPassword = usernameAndPassword.password
        usernameAndPassword.password = await bcrypt.hash(usernameAndPassword.password, salt)
        const userExist = await guestClient.findUnique({ where: { username: usernameAndPassword.username } });
        if (!userExist) {
            const guest = await guestClient.create({ 
                data: {
                    name,
                    contact,
                    username: usernameAndPassword.username,
                    password: usernameAndPassword.password
                } 
            })
            return {
                guest, realPassword
            };
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
        if (method === "qr") {
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
    try {
        const guests = await guestClient.findMany({ select: { username: true, name: true, contact: true } });
        return guests;
    } catch (err) {
        ThrowError(err)
    } finally {
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

module.exports = { CreateNewGuest, GenerateGuestQrCode, GetGuestById, DeleteGuestById, GuestLogin, GetAllGuests };