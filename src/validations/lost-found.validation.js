const { z } = require('zod');
const validate = require('../middlewares/validation');
const { fieldExist, recordExist } = require('../utils/db-validation');

const getLostFoundValidation = validate({
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(5),
  sortOrder: z.enum([
    'pic', 'reported', 'date', 'roomNum'
  ]).optional().default('roomNum'),
  search: z.string().optional().default(''),
  date: z.coerce.date().optional(),
})

const updateLostFoundValidation = validate({
  description: z.coerce.string(),
  location: z.coerce.string(),
  phoneNumber: z.coerce.string(),
  reportedDate: z.coerce.date()
})

const createLostFoundValidation = validate({
  reportedDate: z.coerce.date(),
  time: z.string().refine(time => /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(time), {
    message: 'Time must be in format hh:mm:ss'
  }),
  roomId: z.coerce.number().refine(recordExist('room', 'id'), {
    message: 'Room does not exist',
  }),
  description: z.string(),
  location: z.string(),
})
module.exports = { getLostFoundValidation, createLostFoundValidation, updateLostFoundValidation }