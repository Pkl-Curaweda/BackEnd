const qr = require("qrcode");
const fs = require("fs");
const bcrypt = require("bcrypt");
const { prisma } = require("../../../prisma/seeder/config");
const { encrypt, decrypt } = require("../../utils/encryption");
const { ThrowError, PrismaDisconnect, GenerateUsernameAndPassword } = require("../../utils/helper");
const { CreateAndAssignToken } = require("./M_Token");
const { getAllRoomIdReservedByReserverId } = require("../Front Office/M_ResvRoom");

const CreateNewGuest = async (name, contact) => {
  try {
    const salt = await bcrypt.genSalt();
    const usernameAndPassword = await GenerateUsernameAndPassword(name);
    const realPassword = usernameAndPassword.password
    usernameAndPassword.password = await bcrypt.hash(usernameAndPassword.password, salt)
    const userExist = await prisma.guest.findUnique({ where: { username: usernameAndPassword.username } });
    if (!userExist) {
      const guest = await prisma.guest.create({
        data: {
          name,
          contact,
          username: usernameAndPassword.username,
          password: usernameAndPassword.password
        }
      })
      return {
        guest, realPassword
      };
    }
    throw Error("Username already taken");
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
}

const GuestLogin = async (method, data) => {
  try {
    if (method === "qr") {
      data = decrypt(data);
      data = JSON.parse(data);
    }
    const guest = await prisma.guest.findFirst({
      where: { username: data.username },
      include: { Reserver: true }
    })
    if (!guest) throw Error("Guest Not Found");
    const auth = await bcrypt.compare(data.password, guest.password);
    if (!auth) throw Error("Wrong Password");
    const reservedRoom = await getAllRoomIdReservedByReserverId(guest.Reserver.id);
    const createdToken = await CreateAndAssignToken("guest", guest);
    return {
      guest, createdToken, reservedRoom
    }
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const CreateGuestQrCode = async (guestData) => {
  const storedData = {
      username: guestData.username,
      password: "password",
  };
  const path = `${process.env.QR_PATH}QR-${guestData.username}.png`;
  if (!fs.existsSync(path)) {
      const stringfyData = JSON.stringify(storedData);
      const encryptedData = encrypt(stringfyData);
      const storedQR = "http://localhost:3000/auth/guest/login/qr?encryptedData=" + encryptedData;
      qr.toFile(path, storedQR, (err) => {
          if (err) console.log(err);
      });
  }
  return path;
};

const GetAllGuests = async () => {
  try {
    const guests = await prisma.guest.findMany({ select: {id: true, username: true, name: true, contact: true } });
    return guests;
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const GetGuestById = async (id) => {
  try {
    const guest = await prisma.guest.findFirst({ where: { id } });
    return guest;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const DeleteGuestById = async (id) => {
  try {
    const deletedGuest = await prisma.guest.delete({ where: { id } });
    return deletedGuest;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
    p5;
  }
};

module.exports = { CreateNewGuest, CreateGuestQrCode, GetGuestById, DeleteGuestById, GuestLogin, GetAllGuests };