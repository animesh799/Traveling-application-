const express = require('express');
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const router = express.Router();
const User = require('../models/user');
const usercontroller = require('../controllers/users')

router.route('/register')
    .get(usercontroller.renderregister)
    .post(catchAsync(usercontroller.registeruser))

router.route('/login')
    .get(usercontroller.renderlogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), usercontroller.login)

router.get('/logout', usercontroller.logout)

module.exports = router