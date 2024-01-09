const validate = require("../middlewares/validation");
const { fieldExist, recordExist } =  require("../utils/db-validation.js");
const { z } = require("zod");

const getCleanDirtyRoomValidation = validate({
  page: z.coerce.number().optional().default(1),
  show: z.coerce.number().optional().default(10),
  query: z.string().optional().default(""),
  sort: z.string().optional().refine(fieldExist("room")).default("id"),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
  roomStatusId: z.coerce.number().optional(),
});

const updateRoomStatusValidation = validate({
  roomStatusId: z.coerce.number().refine(recordExist("roomStatus", "id"), {
    message: "Room status doesn't exist"
  }),
  userId: z.coerce.number().refine(recordExist("user", "id"), {
    message: "Room Boy doesn't exist"
  })
})

module.exports = { getCleanDirtyRoomValidation, updateRoomStatusValidation }