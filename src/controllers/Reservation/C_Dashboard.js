const dashboard = require("../../models/Front Office/M_Dashboard")
const { PrismaDisconnect, ThrowError } = require("../../utils/helper")

const getDashboard = async (req, res) => {
    let { page = 1, perPage = 5 } = req.params
    try{
        const data = await dashboard.get('2023/01/02', page, perPage);
        return data
    }catch (err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect();
    }
}

module.exports = { getDashboard }