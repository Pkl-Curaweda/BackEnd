const { getSAArticleData, addEditArticle, deleteArticleById } = require("../../models/Super Admin/M_SAArticle")
const { ThrowError } = require("../../utils/helper")
const { error, success } = require("../../utils/response")

const get = async (req, res) => {
    try {
        const data = getSAArticleData(req.query)
        return success(res, 'Showing Article Page', data)
    } catch (err) {
        return error(res, err.message)
    }
}

const addEdit = async (req, res) => {
    try {
        const article = await addEditArticle(req.body, req.params.action)
        return success(res, article.message, article.data)
    } catch (err) {
        return error(res, err.message)
    }
}

const deleteArticle = async (req, res) => {
    const { id } = req.params
    try{
        const deletedArticle = await deleteArticleById(+id)
        return success(res, `Article ${id} Deleted Successfully`, deletedArticle)
    }catch(err){
        return error(res, err.message)
    }
}

module.exports = { get, addEdit, deleteArticle }