const { z, record } = require('zod');
const validate = require('../../middlewares/validation');
const { recordExist } = require('../../utils/db-validation');

const validateChangeSchedule = validate(({ id }) => ({
    startTime: z.string({
        required_error: 'Please schedule start time'
    }).max(5, { message: "Word must has length of 5" }).includes(':', { message: 'Please send the right format' }),
}))

module.exports = { validateChangeSchedule } 