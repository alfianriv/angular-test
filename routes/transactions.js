const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

/* GET home page. */
router.get("/", async function (req, res, next) {
	const user = req.query.user;
	const order = JSON.parse(req.query.order).dir == "asc" ? "" : "-";
	const field = JSON.parse(
		req.query.columns[JSON.parse(req.query.order).column]
	).data;
	const trx = await Transaction.find()
		.where("user", user)
		.limit(parseInt(req.query.length))
		.skip(parseInt(req.query.start))
		.sort(`${order}${field}`);
	const total_amount = await Transaction.aggregate([
		{
			$group: {
				_id: "$user",
				total: { $sum: "$amount" },
			},
		},
	]);
	const total = await await Transaction.where("user", user).countDocuments();
	res.json({
		draw: trx.length,
		recordsTotal: total,
		data: trx,
		recordsFiltered: total,
		total_amount,
	});
});

module.exports = router;
