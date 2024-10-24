const { userValidationSchema } = require("../utils/joi");
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Environment configuration with defaults
const secret = process.env.JWT_SECRET || "getishjdty-uc565gtduf-fv";
const time = process.env.JWT_LIFESPAN || "2h";

/**
 * Creates a JWT token for user authentication
 * @param {string} userId - The user's ID
 * @returns {string} JWT token
 */
const createToken = (userId) => {
  return jwt.sign({ userId }, secret, {
    expiresIn: time,
  });
};

class UserController {
  /**
   * Creates a new user account
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  static async createUser(req, res) {
    const { email, password, confirmPassword } = req.body;
    const toValidate = { email, password };

    // Input validation
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
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({
          error: "Email already exists",
        });
      }
      const newUser = new User({ email, password });
      await newUser.save();
      return res.status(201).json({
        message: "New user created successfully",
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }

  /**
   * Authenticates a user and returns a JWT token
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
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
        return res.status(401).json({
          error: "Invalid credentials",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          error: "Invalid credentials",
        });
      }

      const token = createToken(user._id);
      return res.status(200).json({
        message: "Login successful",
        token,
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }

  static async logoutUser(req, res) {
    // IMPROVEMENT: Implement token blacklisting or refresh token revocation
  }

  /**
   * Deletes a user account
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  static async deleteUser(req, res) {
    try {
      const userId = req.userId;
      const deletedUser = await User.findByIdAndDelete(userId);
      
      if (!deletedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // TODO: Implement cascade deletion for related data (bots, documents)
      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Updates user password
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  static async changePassword(req, res) {
    try {
      const userId = req.userId;
      const { password, confirmPassword } = req.body;
      if (password !== confirmPassword) {
        return res.status(400).json({
          error: "Passwords do not match",
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // IMPROVEMENT: Add old password verification before allowing change
      user.password = password;
      await user.save();

      return res.status(200).json({
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error('Error changing password:', error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }

  // TODO: Implement OTP functionality
  static async sendOTP(req, res) {
    // Implement email verification system
  }

  static async getOTP(req, res) {
    // Implement OTP verification
  }

  /**
   * Retrieves user profile information
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  static async getUserProfile(req, res) {
    try {
      const userId = req.userId;
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }
      return res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = UserController;