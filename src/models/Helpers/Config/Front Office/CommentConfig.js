const { PrismaClient } = require('@prisma/client');
const commentClient = new PrismaClient().comment;

module.exports = {commentClient};