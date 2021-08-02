var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const saltRounds = 10;

const User = require("../models/User");

// LOGIN
router.post("/login", async function (req, res, next) {
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return res.json({
			error: true,
			message: "Email not registered",
			data: {},
		});
	}

	bcrypt.compare(req.body.password, user.password, function (err, compared) {
		if (err) {
			return res.json({
				error: true,
				message: "Login failed, please try again",
				data: {},
			});
		}

		if (!compared) {
			return res.json({
				error: true,
				message: "Email and password not match",
				data: {},
			});
		}

		const data = { id: user._id, email: user.email, name: user.name };

		return res.json({
			error: false,
			message: "",
			data: {
				...data,
				token: jwt.sign(data, process.env.HASH_PASSWORD),
			},
		});
	});
});

// REGISTER
router.post("/register", async function (req, res, next) {
	const email = await User.findOne({
		email: req.body.email,
	});

	const phone = await User.findOne({
		phone: req.body.phone,
	});

	if (email) {
		return res.json({
			error: true,
			message: "Email already registered",
			data: {},
		});
	}

	if (phone) {
		return res.json({
			error: true,
			message: "Phone already registered",
			data: {},
		});
	}

	bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
		if (err)
			return res.json({
				error: true,
				message: "Register failed, please try again",
				data: {},
			});

		req.body.password = hash;
		User.create(req.body, function (err, user) {
			if (err)
				return res.json({
					error: true,
					message: "Register failed, please try again",
					data: {},
				});
			res.json({ error: false, message: "", data: user });
		});
	});
});

// AUTH
router.get("/getUser", async function (req, res) {
	const token = req.query.token;
	if (!token) {
		return res.json({ error: true, message: "Not Authorized", data: {} });
	}

	const decoded = jwt.verify(token, process.env.HASH_PASSWORD, (err, decoded) => {
		if (err)
			return res.json({
				error: true,
				message: "Not Authorized",
				data: {},
			});
		return res.json({
			error: false,
			message: "",
			data: { ...decoded, token: token },
		});
	});
});

module.exports = router;
