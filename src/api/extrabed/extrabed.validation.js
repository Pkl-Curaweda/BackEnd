import { z } from 'zod'
import validate from '#middleware/validation.js'
import { fieldExist } from '#utils/db-validation.js'

export const getExtraBedValidation = validate({
    page: z.coerce.number().optional().default(1),
    show: z.coerce.number().optional().default(5),
    sort: z.string().optional().refine(fieldExist('extraBed')).default('id'),
    order: z.enum(['asc', 'desc']).optional().default('asc'),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })

  export const createExtrabedValidation = validate({    
    date: z.coerce.date(),
    roomId : z.number(),
    used : z.boolean(),
    remain : z.number(),
  })
  
  export const updateExtrabedValidation = validate({
    date: z.coerce.date(),
    roomId : z.number(),
    used : z.boolean(),
    remain : z.number(),
  })
  
