const { prisma } = require("../../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect } = require("../../../utils/helper")

const getRoomMaidIMPPS = async (req, res) => {
    try{
        const task = "";
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}

module.exports = { getRoomMaidIMPPS }