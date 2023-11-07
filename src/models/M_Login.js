const { PrismaClient } = require("@prisma/client");
const userClient = new PrismaClient().user

const Login = async function(email, password){
    const user = await userClient.findUnique({
        where: {
            email: email
        }
    })
    console.log(user);
}

const GetAllUsers = async () => {
    const user = await userClient.findMany();
    return user;
}

module.exports = { Login, GetAllUsers }