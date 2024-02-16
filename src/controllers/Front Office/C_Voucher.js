const { getAllVoucher, addEditVoucher } = require("../../models/Front Office/M_Voucher")
const { error, success } = require("../../utils/response")

const getAll = async (req, res) => {
    try{
        const vouchers = await getAllVoucher(req.query)
        return success(res, 'Showing all Voucher', vouchers)
    }catch(err){
        return error(res, err.message)
    }
}

const postAddEdit = async (req, res) => {
    try{
        const voucher = await addEditVoucher(req.body, req.params.action)
        return success(res, 'Success', voucher)
    }catch(err){
        return error(res, err.message)
    }
}

module.exports = { getAll, postAddEdit }