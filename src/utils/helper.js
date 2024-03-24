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
const { error } = require('console');

const PrismaDisconnect = async () => {
  await prisma.$disconnect();
}

const ThrowError = (err) => {
  console.log(err)
  throw err
}

const formatToSchedule = (startTime, minutesToAdd) => {
  try {
    console.log(startTime, minutesToAdd)
    const parsedTime = parse(startTime, 'HH:mm', new Date());
    console.log(parsedTime)
    const newTime = addMinutes(parsedTime, minutesToAdd);
    console.log(newTime)
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
  expiredDate.setDate(currentDate.getDate() + 2); //2 days from current date
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

const generateBalanceAndTotal = async (option, reservationId, id) => {
  let totalInvoice = 0, totalPaid = 0;
  try {
    const reservation = await prisma.reservation.findFirstOrThrow({
      where: { id: reservationId },
      select: {
        arrivalDate: true, departureDate: true,
        reserver: { select: { guestId: true } },
        resvRooms: {
          where: { ...(id && { id }) }, select: {
            Invoice: {
              select: { rate: true, paid: true }
            },
            arrangment: { select: { rate: true } }
          }
        }
      }
    })
    for (let resvRoom of reservation.resvRooms) {
      for (let inv of resvRoom.Invoice) {
        totalInvoice += inv.rate
        if (inv.paid != false) totalPaid += inv.rate
      }
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
  return `${process.env.BASE_URL}/public/assets/services/${fileName}`;
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
        return error(res, err.message, null, 422);
      }
      if (!req.file) {
        return error(res, `${fieldName} is required`, null, 400);
      }
      return next();
    });
}

/* File End */

/* Order Helper */

/**
 * @param {number} subTotal
 */
const generateTotal = (subTotal) => {
  const ppn = subTotal * 0.1;
  const fees = 1000;
  const total = subTotal + ppn + fees;

  return total;
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
      path = `/fo/dashboard`
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
    const reservationFromRoom = await prisma.resvRoom.findMany({
      where: {
        deleted: false, roomId
      }, select: { reservation: { select: { arrivalDate: true, departureDate: true } } }
    })
    const dates = generateDateBetweenStartAndEnd(new Date(date.arr), new Date(date.dep))
    for (let date of dates) {
      for (let res of reservationFromRoom) {
        let { arrivalDate, departureDate } = res.reservation
        const check = isDateInRange(date, arrivalDate, departureDate)
        if (check) throw Error(`Room are used | ${arrivalDate.toISOString().split('T')[0]} - ${departureDate.toISOString().split('T')[0]}`)
      }
    }
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
  let percentagesIndex = 5, percentages = [1.4, 1.2, 1, 0.9, 0.8];
  const standardMinuteEntry = percentages.map((factor) => standardMinute * factor);
  console.log(percentagesIndex)
  while (minuteFinish < standardMinuteEntry[percentagesIndex]) percentagesIndex--
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

const convertBooleanToHex = (bool) => {
  return bool ? '#069550' : "#e7e7e7"
}

const convertAmPm = (hour) => {
  return hour > 12 ? hour + " pm" : `${hour.toString().padStart(2, '0')} am`
}




module.exports = {
  splitDateTime,
  convertBooleanToHex,
  countNotificationTime,
  convertAmPm,
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
  generateTotal,
  uploadFile,
  setFileFilter,
  setStorage,
  deleteAsset,
  getFilePath,
  generateAssetUrl,
  getAccessToken,
  verifyToken,
  getOffset,
  emptyOrRows,
  formatToSchedule,
  generateToken,
  countTaxAndTotalInvoice,
  paginate,
};