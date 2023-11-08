const bcrypt = require("bcrypt");

const prisma = require("../db/index");

const UserLogin = async function (email, password) {
  const user = await prisma.user.findUnique({
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
};

const GetAllUsers = async () => {
  const user = await prisma.user.findMany();
  return user;
};

module.exports = { UserLogin, GetAllUsers };
