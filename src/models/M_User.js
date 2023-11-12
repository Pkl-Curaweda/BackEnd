const bcrypt = require("bcrypt");
const { ThrowError } = require("./Helpers/ThrowError");
const { PrismaDisconnect } = require("./Helpers/DisconnectPrisma");
const { userClient } = require("./Helpers/Config/Front Office/UserConfig");

const UserLogin = async function (email, password) {
  try{
    const user = await userClient.findUnique({
      where: {
        email: email,
      },
    });
    if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        return user;
      }
      throw Error("incorect password");
    }
    throw Error("incorect email");
  }catch(err){
    ThrowError(err);
  }finally{
    await PrismaDisconnect();
  }
};

const GetAllUsers = async () => {
  try{
    const user = await userClient.findMany({
      select: {
        username: true,
        email: true,
        role: {
          select: {
            name: true
          }
        }
      }
    });
    return user;
  }catch(err){
    ThrowError(err);
  }finally{
    
  }
};

module.exports = { UserLogin, GetAllUsers };
