const { guestClient } = require("./Helpers/Config/Front Office/GuestConfig");
const { PrismaDisconnect } = require("./Helpers/DisconnectPrisma");
const { ThrowError } = require("./Helpers/ThrowError")

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

module.exports = { CreateNewGuest, GetGuestById, DeleteGuestById };