const { z } = require('zod');
const validate = require('../../middlewares/validation');
const { recordExist } = require('../../utils/db-validation');

const validateCreateReservation = validate({
    nameContact: z.string({
        required_error: 'Please send Guest Name and Phone Number'
    }).includes('/', { message: 'Please send the right format' }),
    resourceName: z.enum(['Walk In', 'Individual reservation'], {
        required_error: 'Please choose Walk In / Individual Reservation',
        invalid_type_error: "Current Reservation only serve Walk In and Individual Reservation"
    })
})

module.exports = { validateCreateReservation }