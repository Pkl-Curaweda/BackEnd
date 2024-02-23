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

const countTaxAndTotalInvoice = (bills) => {
  let total = 0, tax
  try {
    bills.forEach(bill => total += bill.amount)
    tax = (total * 21) / 100 //TODO: NEED TO BE CHANGED
    return { tax, total }
  } catch (err) {
    ThrowError(err)
  }
}

const generateBalanceAndTotal = async (option = { balance: false, total: false }, reservationId, id) => {
  let totalInvoice = 0, totalPaid = 0;
  try {
    const resvRoom = await prisma.resvRoom.findFirstOrThrow({
      where: { id, reservationId },
      select: {
        Invoice: {
          select: {
            rate: true,
            paid: true,
          }
        },
        reservation: {
          select: {
            arrivalDate: true, departureDate: true,
            reserver: { select: { guestId: true, } },
          }
        }, arrangment: { select: { rate: true } }
      }
    })

    for (let inv of resvRoom.Invoice) {
      totalInvoice += inv.rate
      if (inv.paid != false) totalPaid += inv.rate
    }

    const [balance, total] = [totalPaid - totalInvoice, totalInvoice - totalPaid]

    return { balance, total, totalInvoice, totalPaid }

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
    const inputDate = new Date(date);
    const wibDate = new Date(inputDate.getTime() + (7 * 60 * 60 * 1000));
    return {
      date: wibDate.toISOString().split('T')[0],
      time: wibDate.toISOString().split('T')[1].split('.')[0]
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
  const shifts = await prisma.shift.findMany({ select: { startTime: true, endTime: true, restTimeEnd: true, restTimeStart: true, RoomMaid: { select: { id: true, workload: true } } } });
  const currentShifts = shifts.filter((shift) => {
    const shiftStartTime = getMinutesFromTimeString(shift.startTime);
    const shiftEndTime = getMinutesFromTimeString(shift.endTime);
    const restStartTime = getMinutesFromTimeString(shift.restTimeStart);
    const restEndTime = getMinutesFromTimeString(shift.restTimeEnd);
    if (!(currentHour >= restStartTime && currentHour < restEndTime)) return currentHour >= shiftStartTime && currentHour < shiftEndTime;
  });
  return currentShifts;
};

const getLowestWorkloadShift = async (currentHourFormat) => {
  // currentHourFormat = "11:40"
  const roomMaid = await prisma.roomMaid.findFirst({
    where: {
      NOT: [{ workload: { gte: 480 } }],
      shift: {
        AND: [
          { startTime: { lte: currentHourFormat } },
          { endTime: { gt: currentHourFormat } },
          {
            NOT: [
              {
                AND: [
                  { restTimeStart: { lt: currentHourFormat } },
                  { restTimeEnd: { gt: currentHourFormat } }
                ]
              }
            ]
          }
        ],
      }
    }, select: { id: true, workload: true }, orderBy: { workload: 'asc' }
  })
  if (!(roomMaid != null)) throw Error('No one is working now, sorry')
  return roomMaid;
}

const formatCurrency = (num = 0) => {
  try {
    return num.toLocaleString()
  } catch (err) {
    ThrowError(err)
  }
}

const isDateInRange = (date, rangeStart, rangeEnd) => {
  const checkDate = new Date(date);
  return checkDate >= rangeStart && checkDate <= rangeEnd;
};

const loginPath = (ident) => {
  let path
  switch (ident) {
    case "Super Admin":
      path = '/fo/super-admin'
      break;
    case "Admin":
      path = `/`
      break;
    case "Supervisor":
      path = `/hk/spv/dashboard/`
      break
    case "Room Boy":
      path = `/hk/rb/dashboard`
      break
    default:
      throw Error('Unmatched identifier')
  }
  return path
}

async function isRoomAvailable(date = { arr: '', dep: '' }, roomId) {
  try {
    const roomAvailable = await prisma.resvRoom.findMany({
      where: {
        roomId, reservation: {
          AND: [
            { arrivalDate: { gte: `${date.arr.split('T')[0]}T00:00:00.00Z` } },
            { departureDate: { lte: `${date.dep.split('T')[0]}T23:59:59.999Z` } }
          ]
        }, deleted: false
      }
    })
    if (roomAvailable.length != 0) throw Error('Room are used')
    return
  } catch (err) {
    ThrowError(err)
  }
}

async function isArrangementMatch(roomId, checkArrangment) {
  try {
    if (roomId === undefined) throw Error('Sorry you didnt specify the Room Number')
    if (checkArrangment === undefined) throw Error('Please send your Arrangment Code')
    const room = await prisma.room.findFirstOrThrow({ where: { id: roomId, deleted: false }, select: { roomType: { select: { ArrangmentCode: { select: { matchTypeId: true } } } } } })
    if (checkArrangment.split('-')[0] != room.roomType.ArrangmentCode[0].matchTypeId) throw Error('Unmatched Arrangment Code')
    return
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

function reverseObject(obj) {
  const reversedObject = {};
  const keys = Object.keys(obj).reverse();
  for (const key of keys) {
    reversedObject[key] = obj[key];
  }
  return reversedObject;
}

function getTimeDifferenceInMinutes(isoTimestamp1, isoTimestamp2) {
  const date1 = new Date(isoTimestamp1);
  const date2 = new Date(isoTimestamp2);

  const timeDifferenceMs = Math.abs(date2 - date1);

  return Math.floor(timeDifferenceMs / (1000 * 60));
}

function getMaidPerfomance(minuteFinish, standardMinute) {
  let percentagesIndex = 0, percentages = [1.4, 1.2, 1, 0.9, 0.8];
  const standardMinuteEntry = percentages.map((factor) => standardMinute * factor);
  while (minuteFinish < standardMinuteEntry[percentagesIndex]) percentagesIndex++
  return percentagesIndex
}

const countNotificationTime = (newestDate, time) => {
  try {
    const timeDiff = newestDate - time;
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
  } catch (err) {
    ThrowError(err);
  }
};

const countISORange = (startISO, endISO) => {
  try {
    startISO = new Date(startISO).getDate()
    endISO = new Date(endISO).getDate()
    return endISO - startISO
  } catch (err) { ThrowError(err) }
}

const generateDeleteDate = (param) => {
  const currentDate = new Date()
  switch (param) {
    case "deleteResv":
      currentDate.setDate(currentDate.getDate() + 7);
      break;

    case "status6PM":
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(18, 0, 0, 0);
      break;

    default:
      break
  }
  return currentDate.toISOString()
}

const convertBooleanToEmoji = (bool) => {
  return bool ? '#069550' : "#FFFFFF" 
}
module.exports = {
  splitDateTime,
  convertBooleanToEmoji,
  countNotificationTime,
  countISORange,
  loginPath,
  generateDeleteDate,
  getMaidPerfomance,
  isDateInRange,
  getTimeDifferenceInMinutes,
  isArrangementMatch,
  getWorkingShifts,
  getLowestWorkloadShift,
  reverseObject,
  isRoomAvailable,
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
  countTaxAndTotalInvoice,
  paginate,
};