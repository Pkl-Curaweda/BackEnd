const { prisma } = require("../../../../prisma/seeder/config")
const { getSupervisorData, addUnavailableRoomBoy, helperUnavailableRoomBoy, addNewTask, helperAddTask, addNewSupervisorTask } = require("../../../models/House Keeping/IMPPS/M_Supervisor")
const { error, success } = require("../../../utils/response")

const get = async (req, res) =>  {
    try{
        const data = await getSupervisorData(req.query)
        return success(res, 'Get Success', data)
    }catch(err){
        return error(res, err.message)
    }
}


const getHelper = async (req, res) => {
    let { ident } = req.params, data
    try{
        switch(ident){
            case "unavail":
                data = await helperUnavailableRoomBoy(req.query)
                break;
            case "add":
                data = await helperAddTask(req.query)
                break;
            default:
                throw Error('No Identifier Match')
        }
        return success(res, 'Helper running', data)
    }catch(err){
        return error(res, err.message)
    }
}

const postNewTask = async (req, res) => {
    try{
        const createdTask = await addNewSupervisorTask(req.body)
        return success(res, 'Task created succesfully', createdTask)
    }catch(err){
        return error(res, err.message)
    }
}

const postUnavailRoomBoy = async (req, res) => {
    try{
        const updated = await addUnavailableRoomBoy(req.body)
        return success(res, updated.message, updated.assigned)
    }catch(err){
        return error(res, err.message)
    }
}

module.exports = { get, postNewTask, postUnavailRoomBoy, getHelper }