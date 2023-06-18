const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotEnv = require("dotenv");
const User = require("./models/user");
const bcrypt = require("bcrypt")
dotEnv.config();

const app = express();

const isAuthenticated = (req, res, next) => {
  const isLoggedIn = true;
  if (isLoggedIn) {
    next();
  } else {
    res.send({ message: "Please login first" });
  }
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("./public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.json({
    msg: "mission successful",
    warning: "Tom holland is out of spiderman",
  });
});

app.post("/register", async (req, res) => {
  const { email, password, isAdmin } = req.body;
  try {
    const user = await User.find({ email });
    if (user[0]) {
      res.send("User already exists");
    }
  } catch (error) {
    res.send("Error while registering", error);
  }

  const encryptedPassword = await bcrypt.hash(password, 10);
  const newUser = await new User({
    email,
    password: encryptedPassword,
    isAdmin,
  });
  newUser
    .save()
    .then(() => {
      console.log("New user added successfully");
    })
    .catch((err) => {
      console.log("Adding new user failed", err);
    });
});

app.post("/login", async (req, res) => {
  const { email, password, isAdmin } = req.body;
  const user = await User.find({ email })
    .then(async () => {
      if (user) {
        let passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          res.send("User Found");
        } else {
          res.send("Incorrect password");
        }
      }
      res.send('User not found')
    })
    .catch((err) => {
      res.send(err);
    });
});

app.get("/private-route", isAuthenticated, (req, res) => {
  res.json({
    msg: "private-route",
  });
});

app.get("/admin-route", (req, res) => {
  res.json({
    msg: "mission successful",
  });
});

app.listen(process.env.PORT_SERVER, () => {
  mongoose
    .connect(process.env.MONGO_SERVER, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    .then(() => {
      console.log("DB connected succesfully");
    })
    .catch((err) => {
      console.log("DB connection failed", err);
    });
  console.log("Server is running at port:4500");
});
