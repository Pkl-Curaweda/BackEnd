const { z } = require('zod');
const validate = require('../../middlewares/validation');
const { fieldExist, recordExist } = require('../../utils/db-validation');

 const getLostFoundValidation = validate({
  page: z.coerce.number().optional().default(1),
  show: z.coerce.number().optional().default(10),
  sort: z.enum([
    'Room Number', 'Reservation Number', 'Room Type', 'Guest Name'
  ]).optional().default('Room Number'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
  description: z.string().optional().default(''),
  date: z.coerce.date().optional(),
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
module.exports = { getLostFoundValidation, createLostFoundValidation }