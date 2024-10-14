const { userValidationSchema } = require("../utils/joi");
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//creates a jwt token based of the userId
const secret = process.env.JWT_SECRET || "getishjdty-uc565gtduf-fv";
const time = process.env.JWT_LIFESPAN || "1h";
const createToken = (userId) => {
  return jwt.sign({ userId }, secret, {
    expiresIn: time,
  });
};

class UserController {
  static async createUser(req, res) {
    const { email, password, confirmPassword } = req.body;
    const toValidate = { email, password }
    const { error } = userValidationSchema.validate(toValidate);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match",
      });
    }
    try {
      console.log(-2)
      const exists = await User.findOne({ email });
      console.log(-1)
      if (exists) {
        return res.status(400).json({
          error: "Email already exists",
        });
      }
      //verify if the email belongs to a user
      console.log(1);
      const newUSer = new User({ email, password });
      console.log(password)
      console.log(4)
      await newUSer.save();
      console.log(3)
      return res.status(200).json({
        message: "New user created successfully",
        //iplement login
      });
    } catch (error) {
      return res.status(500).json({
        error: `Internal server error: ${error}`,
      });
    }
  }

  static async loginUser(req, res) {
    try {
      const { password, email } = req.body;
      const toValidate = { email, password };
      const { error } = userValidationSchema.validate(toValidate);
      if (error) {
        return res.status(400).json({
          error: error.details[0].message,
        });
      }
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          error: "Invalid email",
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          error: "Incorect password",
        });
      }
      //create a token for the user
      const token = createToken(user._id);
      return res.status(200).json({
        message: "Login succesfull",
        token,
      });
    } catch (error) {
      return res.status(500).json({
        error: `Internal server error ${error}`,
      });
    }
  }

  static async logoutUser(req, res) {
    //destroy the session
  }

  static async deleteUser(req, res) {
    //delete the user from the database
    try {
      const userId = req.userId;
      await User.findByIdAndDelete({ email });
      return res.status(200).json({ message: "User deleted succesfully" });
    } catch (error) {
      return res.status(500).json({ error: `intenal server error ${error}` });
    }
    //delete bots
    //delet documentd
  }

  static async changePassword(req, res) {
    //update the user details
    try {
      const userId = req.userId;
      const { password, confirmPassword } = req.body;
      if (password !== confirmPassword) {
        return res.status(400).json({
          error: "Passwords do not match",
        });
      }
      const user = await User.findById(userId);
      user.password = password;
      await user.save();
      return res.status(200).json({
        message: "Password changed successfully",
      });
    } catch (error) {
      return res.status(500).json({
        error: `Internal server error ${error}`,
      });
    }
  }

  static async forgotPassword(req, res) {
    //send email reset link to the user
  }

  static async getUserProfile(req, res) {
    try {
      const userId = req.userId;
      console.log(userId)
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }
      return res.status(200).json(user);
      //send bot data
      //send document data
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }
}
module.exports = UserController;
