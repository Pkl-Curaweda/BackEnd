import validate from "#middleware/validation.js"
import { fieldExist, recordExist } from '#utils/db-validation.js'
import { z } from 'zod'

export const getOooRoomValidation = validate({
  page: z.coerce.number().optional().default(1),
  show: z.coerce.number().optional().default(10),
  sort: z.string().optional().refine(fieldExist('oooRoom')).default('id'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
  from: z.coerce.date().optional(),
  until: z.coerce.date().optional(),
})

export const createOooRoomValidation = validate({
  roomId: z.coerce.number().refine(recordExist('room', 'id'),{
    message: 'Room does not exist'
  }),
  userId: z.coerce.number().refine(recordExist('user', 'id'),{
    message: 'User does not exist'
  }),
  reservationId: z.coerce.number().refine(recordExist('reservation', 'id'),{
    message: 'Reservation does not exist'
  }),
  reason: z.string(),
  from: z.coerce.date(),
  until: z.coerce.date(),
  description: z.string(),
  departmentId: z.coerce.number().refine(recordExist('department', 'id'),{
    message: 'Department does not exist'
  })
})