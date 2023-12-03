const { createNewLogAvailable } = require("../../models/Reservation/M_Test");
const { error, success } = require("../../utils/response");

const testCreateLog = async (req, res) => {
    try{
        const createdLog = await createNewLogAvailable();
        return success(res, 'Log Created', createdLog)
    }catch(err){
        return error(res, err.message, err.code)
    }
    
}

module.exports = { testCreateLog };