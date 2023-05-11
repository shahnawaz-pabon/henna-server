// user.js
const express = require("express");
const path = require("path");
// const User = require("../models/user");
// const Portfolio = require("../models/portfolio");
const { User, Portfolio } = require("../config/db");
const multer = require("multer");
// Set up Multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.get("/check", async (req, res) => {
  res
    .status(200)
    .json({ data: {}, message: "API successful", status: "success" });
});

router.get("/user/list", async (req, res) => {
  // API logic for getting users
  const users = await User.find().populate("portfolio");
  res.send({ data: users, message: "", status: "success" });
});

router.post("/user/save", async (req, res) => {
  // API logic for creating a user
  try {
    // create a new user with reference to their portfolio
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
      address: req.body.address,
      territory: req.body.territory,
    });

    // create a new portfolio for the user
    const portfolio = new Portfolio({
      designer: user._id,
      designs: ["https://randomuser.me/api/portraits/men/75.jpg"],
    });

    // save the portfolio
    const savedPortfolio = await portfolio.save();

    // set the user's portfolio reference to the new portfolio's _id
    user.portfolio = savedPortfolio._id;

    // save the user
    const savedUser = await user.save();

    res.status(201).json(savedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/user/:id", (req, res) => {
  // API logic for updating a user
});

router.delete("/user/:id", (req, res) => {
  // API logic for deleting a user
});

// POST route for adding a new image to a user's portfolio
router.post(
  "/users/:id/portfolio/images",
  upload.single("image"),
  async (req, res) => {
    const userId = req.params.id;
    // const file = req.file;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let portfolio = await Portfolio.findOne({ designer: user._id });

      if (!portfolio) {
        portfolio = new Portfolio({ designer: user._id });
        await portfolio.save();
        user.portfolio = portfolio._id;
        await user.save();
      }

      // const image = {
      //   filename: req.file.filename,
      //   path: req.file.path,
      //   contentType: req.file.mimetype,
      // };
      portfolio.designs.push(req.file.filename);
      await portfolio.save();

      res.status(200).json({ message: "Image added to portfolio", portfolio });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error adding image to portfolio" });
    }
  }
);

module.exports = router;