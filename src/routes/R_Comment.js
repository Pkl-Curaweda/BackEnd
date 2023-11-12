const { Router } = require('express');
const { postNewComment } = require('../controllers/C_Comment');
const R_Comment = Router();

R_Comment.post('/', postNewComment);

module.exports = R_Comment;