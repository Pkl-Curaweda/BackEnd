const { guestClient } = require("./Helpers/Config/Front Office/GuestConfig");
const { PrismaDisconnect } = require("./Helpers/DisconnectPrisma");
const { ThrowError } = require("./Helpers/ThrowError")
const qr = require("qrcode");

const CreateNewGuest = async (data) => {
    try{
        const guest = await guestClient.create({ data });
        return guest;
    }catch(err){
        ThrowError(err);
    }finally{
        await PrismaDisconnect();
    }
}

const GenerateGuestQrCode = async (guestData) => {
    console.log(guestData);
    const storedData = {
        "id": guestData.id,
        "username": guestData.username,
        "password": guestData.password
    };
    const stringifyData = JSON.stringify(storedData)
    qr.toFile("./src/image/qr.png", stringifyData, (err) => {
        if(err) console.log(err);
    })
    return "QR Code is generated"
}

const GetGuestById = async (id) => {
    try{
        const guest = await guestClient.findFirst({ where: { id }});
        return guest;
    }catch(err){
        ThrowError(err);
    }finally{
        await PrismaDisconnect();
    }
}

const DeleteGuestById = async (guestId) => {
    try{
        const deletedGuest = await guestClient.delete({
            where: {
                id: guestId
            }
        })
        return deletedGuest;
    }catch(err){
        ThrowError(err);
    }finally{
        await PrismaDisconnect();
    }
}

module.exports = { CreateNewGuest, GenerateGuestQrCode, GetGuestById, DeleteGuestById };