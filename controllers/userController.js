const schema =  require('../utils/joi/schema');
const mongoClient = require('../utils/mongoClient');
const User = require('../models/user');
const jwt = require('jsonwebtoken')

//creates a jwt token based of the userId
const secret = process.env.JWT_SECRET || 'getishjdty-uc565gtduf-fv';
const time = process.env.JWT_LIFESPAN || '1h';
const createToken = (userId) => {
    return jwt.sign({userId}, secret, {
        expiresIn: time
    })
}

class UserController{
    static async createUser(req, res) {
        const { password, email ,confirmPassword} = req.body;
        const toValidate = { email, password };
        const { error } = schema.validate(toValidate)
        if (error) {
            res.status(400).json({
                error: error.details[0].message
            })
            return;
        }
        if (password !== confirmPassword) {
            res.status(400).json({
                error: 'Passwords do not match'
            })
            return;
        }
        try {
            const exists = await User.findOne({ email });
            if (exists) {
                res.status(400).json({
                    error: 'Email already exists'
                })
                return;
            }
            //verify if the email belongs to a user
            const newUSer = new User({ email, password });
            await newUSer.save();
            res.status(200).json({
                message: 'New user created successfully'
            })
        }catch (error) {
            res.status(500).json({
                error: `Internal server error: ${error}`
            })
            return;
        }       
    }

    static async loginUser(req, res) {
        try {
            const { password, email } = req.body;
            const toValidate = { email, password };
            const { error } = schema.validate(toValidate)
            if (error) {
                res.status(400).json({
                    error: error.details[0].message
                })
                return;
            }
            const user = await User.findOne({ email });
            if (!user) {
                res.status(400).json({
                    error: 'Invalid email or password'
                })
                return;
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                res.status(401).json({
                    error: "Incorect password"
                })
            }
            //create a token for the user
            const token = createToken(user._id);
            res.status(200).json({
                message : 'Login succesfull',
                token,
            })
        } catch (error) {
            res.status(500).json({
                error: `Internal server error ${error}`,
            })
            return;
        }
    }

    static async logoutUser(req, res) {
        //destroy the session
    }   

    static async deleteUser(req, res) {
        //delete the user from the database
        try {
            const userId = req.userId;
            await User.findByIdAndDelete({ email })
            res.status(200).json({message: 'User deleted succesfully'})
        } catch (error) {
            res.status(500).json({error: `intenal server error ${error}`})
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
                res.status(400).json({
                    error: 'Passwords do not match'
                })
                return;
            }
            const user = await User.findById(userId);
            user.password = password;
            await user.save();
            res.status(200).json({
                message: 'Password changed successfully'
            })
        } catch (error) {
            res.status(500).json({
                error: `Internal server error ${error}`
            })
        }
    }

    static async forgotPassword(req, res) {
        //send email reset link to the user
    }

    static async getUserProfile(res, req) {
        try{
            const userId = req.userId;
            const user = await User.finfById(userId).select('-password');
            if(!user) {
                return res.status(404).json({
                    error: 'User not found'
                })
                return;
            }
            res.status(200).json(user);
            //send bot data
            //send document data
        } catch (error) {
            res.status(500).json({error: `Internal server error: ${error}`});
        }
    }
}
module.exports  = UserController;