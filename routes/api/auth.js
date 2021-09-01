const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
require('dotenv').config();

const mysql = require("mysql2/promise");

const databaseDetails = process.env;

const {
  HOST,
  USER,
  PASSWORD,
  DATABASE,
  DBPORT
} = databaseDetails;



router.post('/register', [
    check('username')
        .not().isEmpty().withMessage('Username is required')
        .isLength({ max: 16 }).withMessage('Username must be less than 16 characters'),
    check('password')
        .not().isEmpty().withMessage('Password is required')
        .isLength({ min: 6, max: 32 }).withMessage('Password must be between 6 - 50 characters'),
    check('email')
        .not().isEmpty().withMessage('Email is required')
        .isEmail().withMessage('Enter a valid email'),
    check('firstName')
        .not().isEmpty().withMessage('First name is required')
        .isLength({ max: 16 }).withMessage('Enter the first 16 characters of your first name'),
    check('lastName')
        .not().isEmpty().withMessage('Last name is required')
        .isLength({ max: 16 }).withMessage('Enter the first 16 characters of your last name'),
  ], 
  async (req, res) => { 

    
    
    // validation checks for all the input fields  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {username, password, email, firstName, lastName} = req.body

    // search database for duplicate username/email
    try {
        const connection = await mysql.createConnection({
            host: HOST,
            user: USER,
            password: PASSWORD,
            database: DATABASE,
            port: DBPORT,
        });
        let findUsername = 0;
        try {
            findUsername = await connection.query(
                `SELECT count(*)
                FROM user
                WHERE username = "${username}"`
            );
        } catch(error) {
            return res.status(500).send(error)
        }
        let findEmail = 0;
        try {
            findEmail = await connection.query(
                `SELECT count(*)
                FROM user
                WHERE email = "${email}"`
            );
        } catch(error) {
            return res.status(500).send(error)
        }
        if (findEmail)  {
            return res.status(400).json({
                invalid_credentials: 'The username or email has already been taken'
            });
        }
        // hash the password before storing
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(password, salt)

        await connection.query(
            `INSERT INTO user (username, password, email, firstName, lastName) VALUES (${username}, ${hashedPassword}, ${email}, ${firstName}, ${lastName})`
        );
    }
    catch(error) {
        return res.status(500).send(error)
    }

});




// router.post('/login', [
//     check('username', 'Username is required').not().isEmpty(),
//     check('password', 'Password is required').not().isEmpty()
//   ], 
//   async (req, res) => { 
//     // validation checks for all the input fields  
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     const {username, password} = req.body

//     // let {usernameInput, passwordInput} = req.body

//     // // sanitize body
//     // const username = req.sanitize(usernameInput)
//     // const password =req.sanitize(passwordInput)

//     try {
//         // search database for account with correct username
//         let account = await Account.findOne({ username: username})
        
//         if (!account) {
//             account = await Account.findOne({ email: username })
//         }

//         if (!account) {
//             return res.status(400).json({
//                 error: 'The username/email or password you entered is incorrect'
//             });
//         }

//         // check password
//         let compareResult = await bcrypt.compare(password, account.password)

//         if (compareResult) {
//             // send jwt
//             const payload = {
//                 user: {
//                     id: account.id
//                 }
//             }
//             // creates token
//             const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1hr'})
//             return res.json({ accessToken })
//         } 
//             else {
//                 return res.status(400).json({
//                     error: 'The username/email or password you entered is incorrect'
//             });
//         }
//     }
//     catch(error) {
//         return res.status(500).send(error)
//     }
// });

module.exports = router;