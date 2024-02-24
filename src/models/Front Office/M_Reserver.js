const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect } = require("../../utils/helper");

const CreateNewReserver = async (guestId, data) => {
    try{
        if(data.resourceName === null) throw Error('Please specify the Resource Name')
        const createdReserver = await prisma.reserver.create({
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