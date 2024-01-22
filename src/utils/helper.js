const jwt = require('jsonwebtoken');
const { z } = require('zod');
const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');
const { addMinutes, format, parse } = require('date-fns');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
require('dotenv').config();
const { prisma } = require("../../prisma/seeder/config");
const config = require('../configs/general.config');

const PrismaDisconnect = async () => {
  await prisma.$disconnect();
}

const ThrowError = (err) => {
  console.log(err)
  throw err
}

const formatToSchedule = (startTime, minutesToAdd) => {
  try {
    const parsedTime = parse(startTime, 'HH:mm', new Date());
    const newTime = addMinutes(parsedTime, minutesToAdd);
    const formattedTime = format(newTime, 'HH:mm');
    return formattedTime;
  } catch (err) {
    ThrowError(err)
  }
};

function generateDateBetweenNowBasedOnDays(pastFuture, manyDays) {
  const dateArray = [];
  const currentDate = new Date();
  for (let i = 0; i <= manyDays - 1; i++) {
    const listDate = new Date(currentDate);
    if (pastFuture === "past") {
      listDate.setDate(currentDate.getDate() - i);
    } else {
      listDate.setDate(currentDate.getDate() + i);
    }
    dateArray.push(listDate.toISOString().split('T')[0]);
  }
  return dateArray;
}


function generateDateBetweenStartAndEnd(startDate, endDate) {
  const dateArray = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    dateArray.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateArray;
}

function generateExpire(currentDate) {
  var expiredDate = new Date(currentDate);
  expiredDate.setDate(currentDate.getDate() + 3); //3 days from now
  return expiredDate;
};

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

function generateStringRandomizer(inputString) {
  const characters = inputString.split('');
  for (let i = characters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [characters[i], characters[j]] = [characters[j], characters[i]];
  }
  return characters.join('');
}

function countNight(arrivalDate, departureDate) {
  const arrivalDateObj = new Date(arrivalDate);
  const departureDateObj = new Date(departureDate);

  const timeDifference = departureDateObj.getTime() - arrivalDateObj.getTime();
  const night = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  return night;

}

const generateVoucherNo = async () => {
  let uniqueVoucherNo, existingResvRoom;
  do {
    uniqueVoucherNo = crypto.randomInt(1000)
    existingResvRoom = await prisma.resvRoom.findFirst({
      where: {
        voucherNo: uniqueVoucherNo
      }
    });
  } while (existingResvRoom);
  return uniqueVoucherNo;
};

const GenerateUsernameAndPassword = async (guestName) => {
  try {
    let username, usernameExist;
    guestName = guestName.split(' ')[0];
    do {
      username = generateStringRandomizer(guestName)
      usernameExist = await prisma.guest.findUnique({ where: { username } })
    } while (usernameExist)
    const password = generateRandomString(8);
    return { username, password }
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect();
  }
}

const countTax = (model) => {
  try {
    let ra = model.reduce((total, pay) => total + pay.amount, 0);
    ra = (ra * 21) / 100
    return ra
  } catch (err) {
    ThrowError(err)
  }
}

const generateBalanceAndTotal = async (option = { balance: false, total: false }, reservationId, id) => {
  try {
    let balance = 0, total = 0;
    const resvRoom = await prisma.resvRoom.findFirstOrThrow({
      where: { id, reservationId },
      select: {
        reservation: {
          select: {
            arrivalDate: true, departureDate: true,
            reserver: { select: { guestId: true, } },
            ResvPayment: {
              select: {
                total: true
              }
            }
          }
        }, arrangment: { select: { rate: true } }
      }
    })

    if (option.balance && option.balance != false) {
      const resvPayments = resvRoom.reservation.ResvPayment
      resvPayments.forEach(payment => balance = balance + payment.total)
    }

    if (option.total && option.total != false) {
      const { arrivalDate, departureDate } = resvRoom.reservation
      const dates = generateDateBetweenStartAndEnd(arrivalDate.toISOString().split("T")[0], departureDate.toISOString().split('T')[0])
      for (date of dates) {
        const orders = await prisma.orderDetail.findMany({
          where: {
            order: { guestId: resvRoom.reservation.reserver.guestId },
            created_at: {
              gte: `${date}T00:00:00.000Z`,
              lte: `${date}T23:59:59.999Z`
            }
          },
          select: {
            qty: true,
            service: { select: { price: true } }
          }
        })
        orders.forEach(order => total = total + (order.qty * order.service.price))

        total = total + resvRoom.arrangment.rate
      }
    }

    return { balance, total }

  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const paginateFO = async (model, options, args = { where: undefined }) => {
  let { page = 1, perPage = 5 } = options;
  model = model
  try {
    const skip = (page - 1) * perPage;
    const [data, total] = await Promise.all([
      model.findMany({
        ...args,
        skip,
        take: perPage
      }),
      model.count({
        where: args.where
      })
    ])
    const lastPage = Math.ceil(total / perPage);

    return {
      [options.name]: data,
      meta: {
        total,
        currPage: page,
        lastPage,
        perPage,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null,
      }
    }
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}


function getOffset(listPerPage, currentPage = 1) {
  return (currentPage - 1) * [listPerPage];
}

function paginator(defaultOptions) {
  return async (model, options, args = { where: undefined }) => {
    try {
      const page = Number(options?.page || defaultOptions.page) || 1;
      const perPage = Number(options?.perPage || defaultOptions.perPage) || 10;

      const skip = (page - 1) * perPage;
      const [data, total] = await Promise.all([
        model.findMany({
          ...args,
          skip,
          take: perPage,
        }),
        model.count({
          where: args.where,
        }),
      ]);
      const lastPage = Math.ceil(total / perPage);

      return {
        data,
        meta: {
          total,
          currPage: page,
          lastPage,
          perPage,
          prev: page > 1 ? page - 1 : null,
          next: page < lastPage ? page + 1 : null,
        },
      };
    } catch (error) {
      throw new Error(error);
    }
  };
}

const paginate = paginator({ perPage: 10 });

function emptyOrRows(rows) {
  if (!rows) {
    return [];
  }
  return rows;
}

/**
 * @param {import('express').Response} res
 */

function errorResponse(res, message, data, code = 500) {
  res.status(code).json({ success: false, message, data });
}

/**
 * @param {import('express').Response} res
 */

function successResponse(res, message, data, code = 200) {
  res.status(code).json({ success: true, message, data });
}

function generateToken(payload) {
  const [at, rt] = [
    jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
      config.secret,
      {
        expiresIn: 60 * 15,
      },
    ),
    crypto.randomBytes(30).toString('hex'),
  ];

  return { at, rt };
}

/**
 * @param {import('express').Request} req
 */

function getAccessToken(req) {
  return req.headers.authorization.split(' ')[1];
}

function verifyToken(token) {
  try {
    const payload = jwt.verify(token, process.env.SECRET_CODE);
    if (!payload.sub || !payload.sub.trim() || !payload) throw new Error('Invalid token');
    return parseInt(payload);
  } catch (error) {
    return error;
  }
}

/**
 * @param {z.ZodSchema<object>} scheme
 */
function validate(scheme) {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  return (req, res, next) => {
    try {
      scheme.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse(res, error.errors[0].message, null, 400);
      }
      return errorResponse(res, 'Internal server error', error.message, 500);
    }
  };
}

/* Encryption */
// const key = crypto
//   .createHash('sha256')
//   .update(config.cryptoSecret)
//   .digest('base64')
//   .substring(0, 32);
// const iv = crypto.createHash('sha256').update(config.cryptoIv).digest('base64').substring(0, 16);

// function encrypt(text) {
//   const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
//   let encrypted = cipher.update(text);
//   encrypted = Buffer.concat([encrypted, cipher.final()]);
//   return encrypted.toString('hex');
// }

// function decrypt(text) {
//   const encryptedText = Buffer.from(text, 'hex');
//   const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
//   let decrypted = decipher.update(encryptedText);
//   decrypted = Buffer.concat([decrypted, decipher.final()]);
//   return decrypted.toString();
// }
/* Encryption End */

/* File */
function getFilePath(url) {
  const fileName = url.split('/').pop();
  return `./public/assets/images/${fileName}`;
}

function generateAssetUrl(fileName) {
  return `${process.env.BASE_URL}/public/assets/images/${fileName}`;
}

function deleteAsset(path) {
  if (fs.existsSync(path) && !path.split('/').pop() === '') {
    fs.unlinkSync(path);
  }
}

function setStorage() {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/assets/images');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  return storage;
}

function setFileFilter(
  allowedTypes = ['image/jpg', 'image/jpeg', 'image/png'],
  fileSize = 1024 * 1024 * 5,
) {
  return (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error('Incorrect file');
      error.code = 'INCORRECT_FILETYPE';
      cb(error, false);
    } else if (file.size > fileSize) {
      const error = new Error('File size is too large');
      error.code = 'FILE_TOO_LARGE';
      cb(error, false);
    }
    cb(null, true);
  };
}

/**
 * @param {import('multer').Options} options
 */

function uploadFile(options, fieldName = 'image') {
  const upload = multer(options).single(fieldName);

  return (req, res, next) =>
    upload(req, res, (err) => {
      if (err) {
        return errorResponse(res, err.message, null, 422);
      }
      if (!req.file) {
        return errorResponse(res, `${fieldName} is required`, null, 400);
      }
      return next();
    });
}

/* File End */

/* Order Helper */

/**
 * @param { {serviceId:number, qty:number}[] } items
 */
async function generateSubtotal(items) {
  let subTotal = 0;

  const services = await prisma.service.findMany({
    where: {
      id: {
        in: items.map((item) => parseInt(item.serviceId, 10)),
      },
    },
  });

  for (const item of items) {
    const service = services.find((s) => s.id === parseInt(item.serviceId, 10));

    if (!service) {
      const err = new PrismaClientKnownRequestError('Service not found', {
        code: 'P2025',
        meta: {
          target: ['service id'],
        },
      });
      throw err;
    }

    subTotal += service.price * parseInt(item.qty, 10);
  }

  return subTotal;
}

/**
 * @param {number} subTotal
 */
function generateTotal(subTotal) {
  const ppn = subTotal * 0.1;
  const fees = 1000;
  const total = subTotal + ppn + fees;

  return total;
}

/**
 * @param {number} id
 * @param {number} qty
 */

async function generateItemPrice(id, qty) {
  const service = await prisma.service.findUnique({
    where: {
      id: parseInt(id, 10),
    },
  });
  if (!service)
    throw new PrismaClientKnownRequestError('Service not found', {
      code: 'P2025',
      meta: {
        target: ['id'],
      },
    });

  return service.price * parseInt(qty, 10);
}

/**
 *
 * @param { string } payload
 * @param { 'POST' || 'GET' || 'PUT' } method
 * @param { string } url
 */
function generateSignature(payload, method, url) {
  // minify payload
  const minifyPayload = JSON.stringify(payload).toLocaleLowerCase().trim();
  const sha256Payload = crypto.createHash('sha256').update(minifyPayload).digest('base64');

  // stringContent
  const stringContent = `${method}:${url}:${sha256Payload}:${new Date()}`;

  //  Base64(SHA256withRSA(stringContent, privateKey))
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(stringContent)
    .sign(config.paymentPrivateKey, 'base64');

  return signature;
}
/* Order Helper End */

const splitDateTime = (date) => {
  try {
    date = new Date(date).toISOString();
    return {
      date: date.split('T')[0],
      time: date.split('T')[1].split('.')[0]
    };
  } catch (err) {
    ThrowError(err)
  }
}

function formatDecimal(input) {
  const parts = input.toString().split('.');
  const integerPart = parts[0];
  let decimalPart = parts[1];

  if (decimalPart) {
    decimalPart = decimalPart.replace(/\./g, ''); // Replace dot with an empty string
    decimalPart = decimalPart.length > 1 ? decimalPart.slice(0, 1) : decimalPart;
  }

  const formattedNumber = decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
  return parseFloat(formattedNumber);
}

const getMinutesFromTimeString = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

const getWorkingShifts = async (currentTime) => {
  const currentHour = currentTime.getHours() * 60 + currentTime.getMinutes();
  const shifts = await prisma.shift.findMany({ select: { startTime: true, endTime: true, RoomMaid: { select: { id: true, workload: true } } } });
  const currentShifts = shifts.filter((shift) => {
    const shiftStartTime = getMinutesFromTimeString(shift.startTime);
    const shiftEndTime = getMinutesFromTimeString(shift.endTime);
    return currentHour >= shiftStartTime && currentHour < shiftEndTime;
  });
  return currentShifts;
};

const formatCurrency = (num = 0) => {
  try {
    return num.toLocaleString()
  } catch (err) {
    ThrowError(err)
  }
}

const loginPath = (ident) => {
  let path
  switch (ident) {
  case "Admin":
      path = `${process.env.ALLOWED_ORIGINS}/`
      break;
    case "Supervisor":
      path = `${process.env.ALLOWED_ORIGINS}/impps/supervisor/`
      break
    case "Room Boy":
      path = `${process.env.ALLOWED_ORIGINS}/impps/roomboy/`
      break
    default:
      throw Error('Unmatched identifier')
  }
  return path
}

module.exports = {
  splitDateTime,
  loginPath,
  getWorkingShifts,
  PrismaDisconnect,
  formatCurrency,
  formatDecimal,
  generateExpire,
  generateDateBetweenNowBasedOnDays,
  generateDateBetweenStartAndEnd,
  generateRandomString,
  generateStringRandomizer,
  countNight,
  ThrowError,
  paginateFO,
  generateVoucherNo,
  GenerateUsernameAndPassword,
  generateBalanceAndTotal,
  generateSignature,
  generateItemPrice,
  generateSubtotal,
  generateTotal,
  uploadFile,
  setFileFilter,
  setStorage,
  deleteAsset,
  getFilePath,
  generateAssetUrl,
  getAccessToken,
  validate,
  verifyToken,
  getOffset,
  emptyOrRows,
  errorResponse,
  formatToSchedule,
  successResponse,
  generateToken,
  countTax,
  paginate,
};