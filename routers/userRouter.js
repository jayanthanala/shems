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

// --- Service Location ---
router.get('/serviceloc', userController.getLoc);
router.post('/serviceloc', userController.addLoc);
router.delete('/serviceloc/:locID', userController.removeLoc);

// --- Devices ---
router.get('/devices', authenticator, userController.getDevice);
router.post('/devices', authenticator, userController.addDevice);
router.delete('/devices/:modelID', authenticator,userController.removeDevice);
// router.post('/isValidUser', userController.isValidUser);

// --- Data Analytics ---
router.get('/dashboard',userController.dashboard);
router.get('/mu/:chart/:locID/:year', userController.MonthyUsage);
router.get('/du/:chart/:locID/:year/:month', userController.DailyUsage);
router.get('/yu/:chart/:locID/:year', userController.YearlyUsage);

// --- Comparision ---
router.get('/compare',userController.compare);

// Dashbpard 
/*
User 1:
  -- Monthly Usage (All 4 - 2021 amd 2022)
  -- Yearly Usage (All 4 - 2021 amd 2022)
  -- Daily Usage (All 4 - 2021 amd 2022)
*/
module.exports = router;