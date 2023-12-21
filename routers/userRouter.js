const express = require('express');
const router = express.Router();
const {authenticator} = require('../auth');

const userController = require('../controllers/userController');

// --- Login/Register ---
router.post('/login',userController.login);
router.post('/register', userController.signup);

// --- Home Page ---
router.get('/home', authenticator, userController.home);
router.get('/home/:locID', authenticator, userController.getDeviceServLoc);

// --- Service Location ---
router.get('/serviceloc',userController.getLoc);
router.post('/serviceloc', authenticator,userController.addLoc);
router.delete('/serviceloc/:locID', authenticator, userController.removeLoc);

// --- Devices ---
router.get('/devices', authenticator, userController.getDevice);
router.post('/devices', authenticator, userController.addDevice);
router.delete('/devices/:deID', authenticator, userController.removeDevice);

// --- Data Analytics ---
router.get('/dashboard',authenticator,userController.dashboard);
router.get('/yu/:chart/:locID',authenticator,userController.YearlyUsage);
router.get('/mu/:chart/:locID/:year/', authenticator, userController.MonthyUsage);
router.get('/du/:chart/:locID/:year/:month', authenticator, userController.DailyUsage);

// --- Comparision ---
router.post('/wowpage',userController.wowPage);
router.post('/zipcodemetrics',userController.zipCodeMetrics);

// Dashbpard 
/*
User 1:
  -- Monthly Usage (All 4 - 2021 amd 2022)
  -- Yearly Usage (All 4 - 2021 amd 2022)
  -- Daily Usage (All 4 - 2021 amd 2022)

  Price/Energy (5*2) - 10 graphs + 2
  -- Service Location Based - Yearly/Monthly/Daily
  -- Appliance Based - Yearly/Monthly
*/
module.exports = router;