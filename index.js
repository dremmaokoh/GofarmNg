// Importing our packages
const express = require("express");
const server = express();
const morgan = require("morgan");
require("dotenv").config();
const path = require("path");
const connectDB = require("./config/db.js");
const user_router = require("./routes/routes.user");
const product_router = require("./routes/routes.product");
const ejs = require("ejs");
const cookieparser = require("cookie-parser");
const session = require('express-session');

//Connecting to database
const port = process.env.PORT || 7895;
connectDB();

//middleware
server.use(morgan("dev"));
server.use(cookieparser());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.set("view engine", "ejs");
server.use(express.static(path.join(__dirname, "views")));

server.use(
  session({
  secret: process.env.KEYS,
  resave: false,
  saveUninitialized: false,
 cookie: { httpOnly: true,
           secure: false,
           maxAge: 24 * 60 * 60 * 1000,
}
}))

server.get("/", (req, res) => {
  res.render("home");
});
server.use("/api", user_router);
server.use("/api/v1", product_router);

//Listening to server
server.listen(port, () => {
  console.log(`Server up and running on port http://localhost:${port}`);
});
