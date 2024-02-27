const { mainMenuIRSData } = require("../../models/In Room Service/M_MainMenu")
const { error, success } = require("../../utils/response")

const getIRSMenu = async (req, res) => {
    try{
        const mainMenu = await mainMenuIRSData(req.user)
        return success(res, 'Showing Main Menu', mainMenu)
    }catch(err){
        return error(res, err.message)
    }
}

module.exports = { getIRSMenu }