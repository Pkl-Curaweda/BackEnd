const { PrismaClient } = require("@prisma/client");
const commentClient = new PrismaClient().comment;

const getAllReservationComment = async () => {
    const comments = await commentClient.findMany({
        where: {
            commentId: "1CUR"
        }
    })
    return comments;
}

const getAllCommentWithId = async (commentId) => {
    const comments = await commentClient.findMany({
        where: { commentId }
    });
    return comments;
}

module.exports = { getAllReservationComment, getAllCommentWithId }