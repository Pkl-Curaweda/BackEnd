const { prisma } = require("../../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../../utils/helper")

const getRoomMaidIMPPS = async () => {
    try{
        
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}

module.exports = { getRoomMaidIMPPS }