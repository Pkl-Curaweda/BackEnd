const { reserverClient } = require("../Helpers/Config/Front Office/ReserverConfig");
const { PrismaDisconnect } = require("../Helpers/DisconnectPrisma");
const { ThrowError } = require("../Helpers/ThrowError")

const CreateNewReserver = async (guestId, data) => {
    try{
        const createdReserver = await reserverClient.create({
            data: {
                guestId,
                resourceName: data.resourceName,
            }
        })

        return createdReserver;
    }catch(err){
        ThrowError(err);
    }finally{
        await PrismaDisconnect();
    }
}

module.exports = { CreateNewReserver }