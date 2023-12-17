const express = require('express');
const router = express.Router();
const {authenticator} = require('../auth');

const userController = require('../controllers/userController');

// --- Login/Register ---
router.post('/login',userController.login);
router.post('/signup', userController.signup);

// --- Home Page ---
router.get('/home', userController.home);
router.get('/home/:locID', userController.getDeviceServLoc);

// --- Add Service Location ---
router.post('/serviceloc', userController.addLoc);

// --- Devices ---
router.get('/devices', userController.getDevice);
router.post('/devices', userController.addDevice);
// router.post('/isValidUser', userController.isValidUser);

// --- Data Analytics ---
router.get('/dashboard', userController.dashboard);
router.get('/mu/:chart/:locID/:year', userController.energyMonthyUsage);
// router.get('/du/:chart/:locID/:year/:month', userController.energyDailyUsage);
// router.get('/yu/:chart/:locID/:year', userController.energyYearlyUsage);

module.exports = router;