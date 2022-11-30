const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Client = require("../models/models.user");
const { passwordHash, passwordCompare } = require("../helper/hashing");
const { jwtSign } = require("../helper/jwt");
const {
  findUserByEmail,
  findUserByNumber,
} = require("../services/user.services");

const transporter = nodemailer.createTransport({
  service: process.env.MAIL,
  auth: {
    user: process.env.USER_MAIL,
    pass: process.env.PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.signUp = async (req, res, next) => {
  try {
    const {
      firstname,
      lastname,
      email,
      role,
      password,
      confirmPassword,
      phoneNumber,
    } = req.body;

    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !confirmPassword ||
      !phoneNumber ||
      !role
    ) {
      return res.status(409).json({
        message: "Please Fill All Fields",
      });
    }
    if (password != confirmPassword) {
      return res.status(409).json({
        message: "The entered passwords do not match!",
      });
    }

    const isExisting = await findUserByEmail(email);
    if (isExisting) {
      return res.status(409).json({
        message: "Email Already existing",
      });
    }
    const sameNumber = await findUserByNumber(phoneNumber);
    if (sameNumber) {
      return res.status(409).json({
        message: "Phone Number Already existing",
      });
    }
    const hashedPassword = await passwordHash(password);

    const user = new Client({
      firstname,
      lastname,
      email,
      role,
      phoneNumber,
      password: hashedPassword,
      emailtoken: crypto.randomBytes(64).toString("hex"),
      isVerified: false,
    });
    const new_user = await user.save();

    await new Promise((resolve, reject) => {
      transporter.verify(function (error, success) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log("Server is ready to rake our messages");
          resolve(success);
        }
      });
    });

    const mailOptions = {
      from: ' "Verify your email" <process.env.USER_MAIL>',
      to: user.email,
      subject: "GoFarmNg - Verify your email",
      html: `<h2> ${user.firstname} ${user.lastname} </h2> 
              <h2> Thank you for registering on our site  </h2> 
             <h4> Please verify your mail to continue..... </h4>
            <a href="${process.env.CLIENT_URL}/api/verify-email?token=${user.emailtoken}">Verify Your Email</a>   `,
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          reject(err);
        } else {
          console.log("Email Sent");
          resolve(info);
        }
      });
    });

    const user_info = {
      message: "Verfication link is sent to your email",
      new_user,
    };
    return res.status(201).json(user_info);
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const token = req.query.token;
    const user = await Client.findOne({ emailtoken: token });
    if (user) {
      user.emailtoken = null;
      user.isVerified = true;
      await user.save();
      const user_info = {
        message: "Email Verfication Successful",
      };
      return res.status(201).json(user_info);
    }
    if (user.isVerified !== "false") {
      return res.status(401).json({ error: "Email Already Verified" });
    } else {
      const no_verify = {
        message: "Email Verfication Not Successful",
      };
      return res.status(409).json(no_verify);
    }
  } catch (error) {
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(409).json({
        message: "Please Fill All Fields",
      });
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        message: "Invalid Email",
      });
    }
    const isMatch = await passwordCompare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password",
      });
    }

    const payload = {
      id: user._id,
    };

    const token = jwtSign(payload);
    res.cookie("access_token", token);
    const dataInfo = {
      status: "success",
      message: "Login success",
      access_token: token,
    };
    return res.status(200).json(dataInfo);
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(409).json({
        message: "Input your email",
      });
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        message: "Invalid Email",
      });
    }

    const secret = process.env.JWT_SECRET + user.password;
    const payload = {
      email: user.email,
      id: user._id,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "15m" });

    await new Promise((resolve, reject) => {
      transporter.verify(function (error, success) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log("Server is ready to rake our messages");
          resolve(success);
        }
      });
    });

    const mailOptions = {
      from: ' "Verify your email" <process.env.USER_MAIL>',
      to: user.email,
      subject: "GoFarmNg - Reset your password",
      html: `<h2> ${user.firstname} ${user.lastname} </h2> 
              <h2> Thank you for using GofarmNg  </h2> 
             <h4> Please click on the link to continue..... </h4>
             <a href="${process.env.CLIENT_URL}/api/reset-password/${user._id}/${token}">Reset Your Password</a>`,
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          reject(err);
        } else {
          console.log("Email Sent");
          resolve(info);
        }
      });
    });
    const user_info = {
      message: "Reset password link is sent to your email",
    };
    return res.status(201).json(user_info);
  } catch (error) {
    next(error);
  }
};

exports.resetPasswordpage = async (req, res, next) => {
  try {
    const { id, token } = req.params;

    const user = await Client.findById({ _id: id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const secret = process.env.JWT_SECRET + user.password;
    const payload = jwt.verify(token, secret);
    res.render("reset-password", { email: user.email });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { id, token } = req.params;
    const { password, confirmPassword } = req.body;

    const user = await Client.findById({ _id: id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const secret = process.env.JWT_SECRET + user.password;
    const payload = jwt.verify(token, secret);
    if (!payload) {
      throw new Error();
    }
    req.user = payload;

    if (!password || !confirmPassword) {
      return res.status(409).json({
        message: "Please Fill All Fields",
      });
    }
    if (password != confirmPassword) {
      return res.status(409).json({
        message: "The entered passwords do not match!",
      });
    }
    const hashedPassword = await passwordHash(password);
    if (user) {
      user.password = hashedPassword;
      await user.save();
      const user_info = {
        message: "Reset Password Successful",
      };
      return res.status(201).json(user_info);
    } else {
      const no_reset = {
        message: "Reset Password Not Successful",
      };
      return res.status(409).json(no_reset);
    }
  } catch (error) {
    next(error);
  }
};

exports.logOut = async (req, res) => {
  res.clearCookie("access_token");
  const logout = {
    message: "Logout Successful",
  };
  return res.status(201).json(logout);
};

exports.switchtoSeller = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(409).json({
        message: "User not found",
      });
    }
    if (user.role === "seller") {
      return res.status(400).json({ message: "User is already a seller" });
    }
    user.role = "seller";
    await user.save();
    res.status(200).json({ message: "User role changed to seller" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
