const { prisma } = require("../config");

const comment = [
	{
		commentId: process.env.DEFAULT_COMMENT_ID,
		body: "Icikiwir awikwok",
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

async function CommentSeed() {
	for (let Comment of comment) {
		await prisma.comment.create({
			data: Comment,
		});
	}
}

module.exports = { CommentSeed };
