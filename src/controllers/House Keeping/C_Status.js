
const e = require("express")
const { prisma } = require("../../../prisma/seeder/config")
const { getStatusData, refreshTask } = require("../../models/House Keeping/M_Status")
const { error, success } = require("../../utils/response")
const { getAllToday } = require("../../models/House Keeping/IMPPS/M_MaidTask")

const get = async (req, res) => {
    try {
        const statusData = await getStatusData(req.query)
        return success(res, 'Get Success', statusData)
    } catch (err) {
        return error(res, err.message)
    }
}

const getTask = async (req, res) =>  {
    try{
       const tasks = await refreshTask(req.query)
        return success(res, 'Task Shown', tasks)
    }catch(err){
        return error(res, err.message)
    }
}
module.exports = { get, getTask }