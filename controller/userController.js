const schema =  require('../utils/joi/schema');
const mongoClient = require('../utils/mongoClient');
const User = require('../models/user');

class UserController{
    static async createUser(req, res) {
        const { password, email} = req.body;
        const toValidate = { email, password };
        const { error } = schema.validate(toValidate)
        if (error) {
            res.status(400).json({
                error: error.detail[0].message
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
            res.send(200).json({
                message: 'New user created'
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
                    error: error.detail[0].message
                })
                return;
            }
            const user = await User.findOne({ email, password });
            if (!user) {
                res.status(400).json({
                    error: 'Invalid email or password'
                })
                return;
            }
            //create a session for the user
        } catch (error) {
            res.status(500).json({
                error: `Internal server error ${error}`;
            })
            return;
        }
    }

    static async logoutUser(req, res) {
        //destroy the session
    }   

    static async deleteUser(req, res) {
        //delete the user from the database
        const { email, password } = req.body;
        const toValidate = { email, password };
        const { error } = schema.validate(toValidate);
        if (error) {
            res.status(400).json({
                error: 'Missing email or password'
            })
            return;
        }
        try {
            const toBeDeleted = await User.findOne({ email })
            if (!toBeDeleted) {
                res.status(404).json({
                    error : 'User not found'
                })
                return;
            }
            await User.deleteOne({ email })
            res.status(200).json({message: 'User deleted succesfully'})
        } catch (error) {
            res.status(500).json({error: `intenal server error ${error}`})
        }       

    }

    static async changePassword(req, res) {
        //update the user details
    }

    static async forgotPassword(req, res) {
        //send email reset link to the user
    }
}