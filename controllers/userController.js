const bcrypt = require("bcrypt");
const con = require('../config/dbconfig.js');
const jwt = require('jsonwebtoken');

// ---- Login Routes ----
const login = async (req, res) => {
  try{
    const { email, password } = req.body;
    con.query("SELECT * FROM User_Login WHERE email = ?", [email], async (error, results) => {
      if(error){
        res.json({
          status: false,
          message: "Error",
          errors: error.message,
          data: {},
          });
      }else{
      await bcrypt.compare(password, results[0].user_password, (err, result) => {
        if (err) { throw (err); }
        else if(result){
          var custID = results[0].custid;
          var token = jwt.sign({custID,email}, process.env.JWT_ACCESS_TOKEN, { expiresIn: '24h' });
          res.json({
            status: true,
            message: "Logged In Successfully",
            data: {"token": token},
          });
        }else{
          res.json({
            status: false,
            message: "Invalid Credentials",
            data: {},
          });
        }
      });
    }
    });
  } catch(error) {
    res.json({
      status: false,
      message: "Error",
      errors: error.message,
      data: {},
      });
  }
};

// ---- Signup Routes ----
const signup = async (req, res) => {
try{
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  con.query("INSERT INTO Customers (email, firstName, lastName, address_line, city, state, zipcode) VALUES (?, ?, ?, ?, ?, ?, ?);", [email, req.body.firstName, req.body.lastName, req.body.address_line, req.body.city, req.body.state, req.body.zipcode],async  (error, results) => {
    if(error){
      res.json({
        status: false,
        message: "Error 0",
        errors: error.message,
        data: {},
        });
    }
    else{
      con.query("SELECT custID from Customers where email=?", [email],async  (error, custres) => {
        if(error){
          res.json({
            status: false,
            message: "Error 1",
            errors: error.message,
            data: {},
            });
        }else{
          con.query("INSERT INTO User_Login (email, custid, user_password) VALUES (?, ?, ?)", [email, custres[0].custID,hashedPassword],async  (error, addres) => {
            if(error){
              res.json({
                status: false,
                message: "Error 2",
                errors: error.message,
                data: {},
                });
            }else{
              res.json({
                status: true,
                message: "Registered Successfully",
                data: {},
              });
            }
          });
        }
    });
  }
  });
}catch(error){
  res.json({
    status: false,
    message: "Error",
    errors: error.message,
    data: {},
    });
}
}

// --- Get Service Location ----
const getLoc = async (req, res) => {
  try{
    con.query("SELECT * FROM Service_Location WHERE custID=?",[req.user.custID],async (error, results) => {
      if(error){
        res.json({
          status: false,
          message: "Error",
          errors: error.message,
          data: {},
          });
      }else{
        res.json({
          status: true,
          message: "Service Location fetched Successfully",
          data: results
        });
      }
    });
  }catch(error){
      res.json({
        status: false,
        message: "Error",
        errors: error.message,
        data: {},
        });
    }

}

// --- Add Service Location ----
const addLoc = async (req, res) => {
  try{
    const {loc_type, address_line, city, state, zipcode, date_tookover, area, num_bed, num_occupants} = req.body;
    const custID = req.user.custID;
    con.query("INSERT INTO Service_Location (custID, loc_type, address_line, city, state, zipcode, date_tookover, area, num_bed, num_occupants, plabel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [custID, loc_type, address_line, city, state, zipcode, date_tookover, area, num_bed, num_occupants, plabel],async  (error, results) => {
      if(error){
        res.json({
          status: false,
          message: "Error",
          errors: error.message,
          data: {},
          });
      }
      else{
        res.json({
          status: 200,
          message: "Service Location Added Successfully",
          data: results,
        });
      }
    });
    res.json({
      status:true,
      message: "Service Location Added Successfully",
      data: req.body,
    });
  }catch(error){
    res.json({
      status: false,
      message: "Error",
      errors: error.message,
      data: {},
      });
  }
}

// --- Remove Service Location ----
const removeLoc = async (req, res) => {
  try{
    const {locID} = req.params;
    con.query("DELETE Usage_Data, Device_Enrollment, Service_Location\
    FROM Usage_Data\
    JOIN Device_Enrollment ON Usage_Data.deID = Device_Enrollment.deID\
    JOIN Service_Location ON Device_Enrollment.locID = Service_Location.locID\
    WHERE Device_Enrollment.locID = ?;", [locID],async  (error, results) => {
      if(error){
        res.json({
          status: false,
          message: "Error",
          errors: error.message,
          data: {},
          });
      }
      else{
        res.json({
          status: true,
          message: "Service Location Removed Successfully",
          data: results,
        });
      }
    });
  }catch(error){
    res.json({
      status: false,
      message: "Error",
      errors: error.message,
      data: {},
      }); 
  }
}

// --- Get Device Models ---
const getDevice =  async (req, res) => {
  try{
    console.log(req.user);
    con.query("SELECT locID, address_line, city, state, zipcode FROM Service_Location WHERE custID=?",[req.user.custID],async (error, sevlocs) => {
      if(error){
        res.json({
          status: false,
          message: "Serv Location Error",
          errors: error.message,
          data: {},
          });
      }else{
        con.query("SELECT * FROM Device_Models", async (error, results) => {
          if(error){
            res.json({
              status: false,
              message: "Error",
              errors: error.message,
              data: {},
              });
          }
          else{
            res.json({
              status: true,
              message: "Device Models Retrieved Successfully",
              devicedata: results,
              serviceLocationData: sevlocs
            });
          }
        });
  }})
  }catch(error){
    res.json({
      status: false,
      message: "Error",
      errors: error.message,
      data: {},
      });
  }
}

// --- Add devices to service location w.r.t customer ---
const addDevice =  async (req, res) => {
  try{
    const {modelID, locID} = req.body;
    console.log(req.body);
    con.query("INSERT INTO Device_Enrollment (modelID, locID) VALUES (?, ?)", [modelID, locID],async  (error, results) => {
      if(error){
        res.json({
          status: false,
          message: "Error",
          errors: error.message,
          data: {},
          });
      }
      else{
        res.json({
          status: true,
          message: "Device Model added Successfully",
          devicedata: req.body
        });
      }
    });
  }catch(error){
    res.json({
      status: false,
      message: "Error",
      errors: error.message,
      data: {},
      });
  }
}

// --- Add devices to service location w.r.t customer ---
const removeDevice =  async (req, res) => {
  try{
    con.query("DELETE Usage_Data, Device_Enrollment\
    FROM Usage_Data ud\
    JOIN Device_Enrollment de ON ud.deID = de.deID\
    WHERE de.modelID = ?;",[req.params.modelID],async (error, results) => {
      if(error){
        res.json({
          status: false,
          message: "Error",
          errors: error.message,
          data: {},
          });
      }
      else{
        res.json({
          status: true,
          message: "Device Model removed Successfully",
          devicedata: req.body
        });
      }
    });
  }catch(error){
    res.json({
      status: false,
      message: "Error",
      errors: error.message,
      data: {},
      });
  }
}

// --- Home Page ---
const home = async (req, res) => {
  try{
    con.query("SELECT * FROM Customers WHERE custID=?",[req.user.custID],async (error, userData) => {
      if(error){
        res.json({
          status: false,
          message: "Error",
          errors: error.message,
          data: {},
          });
      }
      else{
        con.query("SELECT * FROM Service_Location WHERE custID=?",[req.user.custID],async (error, results) => {
          if(error){
            res.json({
              status: false,
              message: "Error",
              errors: error.message,
              data: {},
              });
          }
          else{
            res.json({
              status: true,
              message: "Service Location fetched Successfully",
              serviceLocationData: results,
              userDetails: userData[0]
            });
          }
        });
      }
    });
  }catch(error){
      res.json({
        status: false,
        message: "Error",
        errors: error.message,
        data: {},
        });
    }
}


// --- Home Page: Devices w.r.t Service Location 
const getDeviceServLoc = async (req, res) => {
  try{
    con.query("SELECT * FROM Device_Enrollment AS de JOIN Device_Models as dm ON dm.modelID = de.modelID WHERE de.locID=?",[req.params.locID],async (error, results) => {
      if(error){
        res.json({
          status: false,
          message: "Error",
          errors: error.message,
          data: {},
          });
      }
      else{
        res.json({
          status: 200,
          message: "Devices fetched Successfully",
          deviceData: results,
        });
      }
    });
  }catch(error){
      res.json({
        status: false,
        message: "Error",
        errors: error.message,
        data: {},
        });
    }
}

// -- Data Analytics --
const dashboard = async (req, res) => {
  try{
    con.query("SELECT * FROM Service_Location WHERE custID=?",[1],async (error, results) => {
      if(error){
        res.json({
          status: false,
          message: "Error",
          errors: error.message,
          data: {},
          });
      }else{
        res.json({
          status: true,
          message: "Service Location fetched Successfully",
          data: results
        });
      }
    });
  }catch(error){
      res.json({
        status: false,
        message: "Error",
        errors: error.message,
        data: {},
        });
    }
}

// -- Energy Usage - Monthly based on Location --
const MonthyUsage = async (req, res) => {
  try{
    var query
    var {chart, year, locID} = req.params;
    console.log(year);
    if(chart== 0){
      // -- Price - Monthly Based on location
      query="select\
      sl.locID as Location_ID,MONTH(ud.data_timestamp) as month,\
      SUM(ud.energy_used * ec.price) as y_axis,\
      SUM(ud.energy_used) as total_energy_used\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      inner join Energy_Cost_Backup ec on ec.zipcode = sl.zipcode and \
      DATE_FORMAT(ec.time_loc, '%Y-%m-%d %H:00:00') = DATE_FORMAT(ud.data_timestamp, '%Y-%m-%d %H:00:00')\
      WHERE sl.locID=? and YEAR(ud.data_timestamp)=?\
      group by Location_ID,month order by month;"
    }else if(chart==2){
      //-- Energy Usage - Monthly based on Location
      query = "select\
      sl.locID as Location_ID,MONTH(ud.data_timestamp) as month,\
      SUM(ud.energy_used) as y_axis\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      WHERE sl.locID=? and YEAR(ud.data_timestamp)=?\
      group by Location_ID,month order by month;"
    }else if(chart==1){
      //-- Price - Monthly Based on model and location
      query = "select\
      sl.locID as Location_ID,MONTH(ud.data_timestamp) as month,\
      dm.deviceType device_type,\
      SUM(ud.energy_used * ec.price) as price_monthly\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      inner join Device_Models dm on dm.modelID = de.modelID\
      inner join Energy_Cost_Backup ec on ec.zipcode = sl.zipcode and \
      DATE_FORMAT(ec.time_loc, '%Y-%m-%d %H:00:00') = DATE_FORMAT(ud.data_timestamp, '%Y-%m-%d %H:00:00')\
      where sl.locID = ? and YEAR(ud.data_timestamp)=?\
      group by Location_ID,month,device_type order by month,device_type;"

      await res.json({
        status: true,
        message: "Devices fetched Successfully",
        deviceData: [{
          x_axis:"AC",
          y_axis: 180.45
        },{
          x_axis:"Heater",
          y_axis: 80.45
        },{
          x_axis:"Fridge",
          y_axis: 20.45
        },{
          x_axis:"TV",
          y_axis: 10.45
        }
        ],
      })
    }else{
      //-- Energy - Monthly Based on model and location
      query = "select\
      sl.locID as ,MONTH(ud.data_timestamp) as month,\
      dm.deviceType device_type,\
      SUM(ud.energy_used) as energy_monthly\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      inner join Device_Models dm on dm.modelID = de.modelID\
      where sl.locID = ? and YEAR(ud.data_timestamp)=?\
      group by Location_ID,month,device_type order by month,device_type;"
    }
    con.query(query,[locID, year],async (error, results) => {
      if(error){
        res.json({
          status: false,
          message: "Error",
          errors: error.message,
          data: {},
          });
      }
      else{
        res.json({
          status: true,
          message: "Devices fetched Successfully",
          deviceData: results,
        });
      }
    });
  }catch(error){
      res.json({
        status: false,
        message: "Error",
        errors: error.message,
        data: {},
        });
    }
}

// -- Energy Usage - Daily based on Location --
const DailyUsage = async (req, res) => {
  try{
    var query
    var {chart, year, locID} = req.params;
    console.log(year);
    if(chart== 0){
      // -- Price - Monthly Based on location
      query="select\
      sl.locID as Location_ID,MONTH(ud.data_timestamp) as month,\
      SUM(ud.energy_used * ec.price) as y_axis,\
      SUM(ud.energy_used) as total_energy_used\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      inner join Energy_Cost_Backup ec on ec.zipcode = sl.zipcode and \
      DATE_FORMAT(ec.time_loc, '%Y-%m-%d %H:00:00') = DATE_FORMAT(ud.data_timestamp, '%Y-%m-%d %H:00:00')\
      WHERE sl.locID=? and YEAR(ud.data_timestamp)=?\
      group by Location_ID,month order by month;"
    }else if(chart==2){
      //-- Energy Usage - Monthly based on Location
      query = "select\
      sl.locID as Location_ID,MONTH(ud.data_timestamp) as month,\
      SUM(ud.energy_used) as y_axis\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      WHERE sl.locID=? and YEAR(ud.data_timestamp)=?\
      group by Location_ID,month order by month;"
    }else if(chart==1){
      //-- Price - Monthly Based on model and location
      query = "select\
      sl.locID as Location_ID,MONTH(ud.data_timestamp) as month,\
      dm.deviceType device_type,\
      SUM(ud.energy_used * ec.price) as price_monthly\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      inner join Device_Models dm on dm.modelID = de.modelID\
      inner join Energy_Cost_Backup ec on ec.zipcode = sl.zipcode and \
      DATE_FORMAT(ec.time_loc, '%Y-%m-%d %H:00:00') = DATE_FORMAT(ud.data_timestamp, '%Y-%m-%d %H:00:00')\
      where sl.locID = ? and YEAR(ud.data_timestamp)=?\
      group by Location_ID,month,device_type order by month,device_type;"

      await res.json({
        status: true,
        message: "Devices fetched Successfully",
        deviceData: [{
          x_axis:"AC",
          y_axis: 180.45
        },{
          x_axis:"Heater",
          y_axis: 80.45
        },{
          x_axis:"Fridge",
          y_axis: 20.45
        },{
          x_axis:"TV",
          y_axis: 10.45
        }
        ],
      })
    }else{
      //-- Energy - Monthly Based on model and location
      query = "select\
      sl.locID as ,MONTH(ud.data_timestamp) as month,\
      dm.deviceType device_type,\
      SUM(ud.energy_used) as energy_monthly\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      inner join Device_Models dm on dm.modelID = de.modelID\
      where sl.locID = ? and YEAR(ud.data_timestamp)=?\
      group by Location_ID,month,device_type order by month,device_type;"
    }
    con.query(query,[locID, year],async (error, results) => {
      if(error){
        res.json({
          status: false,
          message: "Error",
          errors: error.message,
          data: {},
          });
      }
      else{
        res.json({
          status: true,
          message: "Devices fetched Successfully",
          deviceData: results,
        });
      }
    });
  }catch(error){
      res.json({
        status: false,
        message: "Error",
        errors: error.message,
        data: {},
        });
    }
}

// -- Energy Usage - Yearly based on Location --
const YearlyUsage = async (req, res) => {
  try{
    var query
    var {chart, year, locID} = req.params;
    console.log(year);
    if(chart== 0){
      // -- Price - Monthly Based on location
      query="select\
      sl.locID as Location_ID,MONTH(ud.data_timestamp) as month,\
      SUM(ud.energy_used * ec.price) as y_axis,\
      SUM(ud.energy_used) as total_energy_used\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      inner join Energy_Cost_Backup ec on ec.zipcode = sl.zipcode and \
      DATE_FORMAT(ec.time_loc, '%Y-%m-%d %H:00:00') = DATE_FORMAT(ud.data_timestamp, '%Y-%m-%d %H:00:00')\
      WHERE sl.locID=? and YEAR(ud.data_timestamp)=?\
      group by Location_ID,month order by month;"
    }else if(chart==2){
      //-- Energy Usage - Monthly based on Location
      query = "select\
      sl.locID as Location_ID,MONTH(ud.data_timestamp) as month,\
      SUM(ud.energy_used) as y_axis\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      WHERE sl.locID=? and YEAR(ud.data_timestamp)=?\
      group by Location_ID,month order by month;"
    }else if(chart==1){
      //-- Price - Monthly Based on model and location
      query = "select\
      sl.locID as Location_ID,MONTH(ud.data_timestamp) as month,\
      dm.deviceType device_type,\
      SUM(ud.energy_used * ec.price) as price_monthly\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      inner join Device_Models dm on dm.modelID = de.modelID\
      inner join Energy_Cost_Backup ec on ec.zipcode = sl.zipcode and \
      DATE_FORMAT(ec.time_loc, '%Y-%m-%d %H:00:00') = DATE_FORMAT(ud.data_timestamp, '%Y-%m-%d %H:00:00')\
      where sl.locID = ? and YEAR(ud.data_timestamp)=?\
      group by Location_ID,month,device_type order by month,device_type;"

      await res.json({
        status: true,
        message: "Devices fetched Successfully",
        deviceData: [{
          x_axis:"AC",
          y_axis: 180.45
        },{
          x_axis:"Heater",
          y_axis: 80.45
        },{
          x_axis:"Fridge",
          y_axis: 20.45
        },{
          x_axis:"TV",
          y_axis: 10.45
        }
        ],
      })
    }else{
      //-- Energy - Monthly Based on model and location
      query = "select\
      sl.locID as ,MONTH(ud.data_timestamp) as month,\
      dm.deviceType device_type,\
      SUM(ud.energy_used) as energy_monthly\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      inner join Device_Models dm on dm.modelID = de.modelID\
      where sl.locID = ? and YEAR(ud.data_timestamp)=?\
      group by Location_ID,month,device_type order by month,device_type;"
    }
    con.query(query,[locID, year],async (error, results) => {
      if(error){
        res.json({
          status: false,
          message: "Error",
          errors: error.message,
          data: {},
          });
      }
      else{
        res.json({
          status: true,
          message: "Devices fetched Successfully",
          deviceData: results,
        });
      }
    });
  }catch(error){
      res.json({
        status: false,
        message: "Error",
        errors: error.message,
        data: {},
        });
    }
}

// -- User Comparisions -- 
const compare = async (req, res) => {
  try{
    con.query("SELECT * FROM Service_Location WHERE custID=?",[req.user.custID],async (error, results) => {
      if(error){
        res.json({
          status: false,
          message: "Error",
          errors: error.message,
          data: {},
          });
      }else{
        res.json({
          status: true,
          message: "Service Location fetched Successfully",
          data: results
        });
      }
    });
  }catch(error){
      res.json({
        status: false,
        message: "Error",
        errors: error.message,
        data: {},
        });
    }
}

module.exports = {
  login,
  signup,
  addLoc,
  addDevice,
  getDevice,
  home,
  getDeviceServLoc,
  MonthyUsage,
  YearlyUsage,
  removeDevice,
  dashboard,
  removeLoc,
  DailyUsage,
  getLoc,
  compare
};