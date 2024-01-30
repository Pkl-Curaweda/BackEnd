const { prisma } = require("../../../../prisma/seeder/config")
const { getSupervisorData } = require("../../../models/House Keeping/IMPPS/M_Supervisor")
const { error, success } = require("../../../utils/response")

const get = async (req, res) =>  {
    try{
        const data = await getSupervisorData()
        return success(res, 'Operation Success', data)
    }catch(err){
        return error(res, err.message)
    }
}

module.exports = { get }