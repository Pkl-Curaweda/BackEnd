const { z } = require('zod')
const validate =  require('../middlewares/validation')
const { fieldExist, recordExist } = require('../utils/db-validation')

const getRoomMaidValidation = validate({
  page: z.coerce.number().optional().default(1),
  show: z.coerce.number().optional().default(10),
  query: z.string().optional().default(''),
  sort: z.string().optional().refine(fieldExist('user')).default('id'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
  room: z.coerce.number().optional(),
  roomTo: z.coerce.number().optional(),
  roleId: z.coerce.number().optional()
})

const createRoomMaidValidation = validate({
  userId: z.coerce.number().refine(recordExist('user', 'id'), {
    message: 'User does not exist',
  }),
  roomStatusId: z.coerce.number().refine(recordExist('roomStatus', 'id'), {
    message: 'Room Status does not exist',
  }),
  departmentId: z.coerce.number().refine(recordExist('department', 'id'), {
    message: 'Department does not exist',
  }),
  resvRoomId: z.coerce.number().refine(recordExist('resvRoom', 'id'), {
    message: 'Reservation Room does not exist',
  }),
  no: z.string(),
  done: z.coerce.boolean().default(false),
  departure: z.coerce.date(),
  arrival:z.coerce.date(),
  note: z.string(),
})

module.exports = { getRoomMaidValidation, createRoomMaidValidation }