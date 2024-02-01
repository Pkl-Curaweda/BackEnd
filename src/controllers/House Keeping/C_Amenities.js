const { prisma } = require("../../../prisma/seeder/config.js");
const { getAllAmenitiesData } = require("../../models/House Keeping/M_Amenities.js");
const { error, success } = require('../../utils/response.js');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function findAll(req, res) {
  try{
    const data = await getAllAmenitiesData(req.params.art, req.query)
    return success(res, 'Get Success', data)
  }catch(err){
    return error(res, err.message)
  }
}

module.exports = { findAll}