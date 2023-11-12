const { addComment } = require("../models/M_Comment");

const postNewComment = async (req, res) => {
    const body = req.body;
    if(!body.commentId) body.commentId = process.env.DEFAULT_COMMENT_ID;
    const comment = await addComment(body);
    return comment;
}

module.exports = { postNewComment }