const { PrismaDisconnect } = require("./Helpers/DisconnectPrisma");
const commentClient = require("./Helpers/Config/Front Office/CommentConfig");
const { ThrowError } = require("./Helpers/ThrowError");

const getAllReservationComment = async () => {
    try {
        const comments = await commentClient.findMany({
            where: {
                commentId: process.env.DEFAULT_COMMENT_ID
            },
            select: {
                body: true,
                createdAt: true
            }
        })
        return comments;
    } catch (err) {
        ThrowError(err);
    } finally {
        await PrismaDisconnect();
    }
}

const getAllCommentWithId = async (commentId) => {
    try {
        const comments = await commentClient.findMany({
            where: { commentId },
            select: {
                body: true,
                createdAt: true
            }
        });
        return comments;
    } catch (err) {
        ThrowError(err);
    }finally{
        await PrismaDisconnect();
    }
}

const addComment = async (data) => {
    try {
        const comment = await commentClient.create({ data })
        return comment;
    } catch (err) {
        ThrowError(err);
    } finally {
        await PrismaDisconnect();
    };
}

module.exports = { getAllReservationComment, getAllCommentWithId, addComment }