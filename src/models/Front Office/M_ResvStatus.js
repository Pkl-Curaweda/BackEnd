const { ThrowError, PrismaDisconnect } = require("#utils/helper")

const changeResvStatus = async (id, resvStatusId) => {
    try{

    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}