const { error } = require("../../../utils/response")

const get = (req, res) => {
    try{
        
    }catch(err){
        return error(res, err.message)
    }
}

module.exports = { get }