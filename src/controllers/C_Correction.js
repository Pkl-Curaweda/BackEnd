const { findData } = require("../models/M_Correction");

const getAllData = async (req, res) => {
	const sortingPage = await findData();

	res.status(200).json({ sortingPage });
};

module.exports = { getAllData };
