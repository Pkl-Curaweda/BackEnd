const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const userClient = new PrismaClient().user

const Login = async function(email, password){
    const user = await userClient.findUnique({
        where: {
            email: email
        }
    })
    if(user){
        const auth = await bcrypt.compare(password, user.password)
        if(auth){
            return user
        }
    }
    
}

const GetAllUsers = async () => {
    const user = await userClient.findMany()
    return user;
}

module.exports = { Login, GetAllUsers }