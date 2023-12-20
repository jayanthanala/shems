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
              var custID = custres[0].custID;
              var token = jwt.sign({custID,email}, process.env.JWT_ACCESS_TOKEN, { expiresIn: '24h' });
              res.json({
                status: true,
                message: "Signed Up Successfully",
                data: {"token": token},
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
    console.log(req.user);
    con.query("INSERT INTO Service_Location (custID, loc_type, address_line, city, state, zipcode, date_tookover, area, num_bed, num_occupants) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [custID, loc_type, address_line, city, state, zipcode, date_tookover, area, num_bed, num_occupants],async  (error, results) => {
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
          message: "Service Location Added Successfully",
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

// --- Remove Service Location ----

const removeLoc = async (req, res) => {
  try{
    const {locID} = req.params;
    con.query("delete from Usage_Data where deID in (select deID from Device_Enrollment where locID = ?)", [locID],async  (error, results0) => { 
      if(error){
        res.json({
          status: false,
          message: "Error",
          errors: error.message,
          data: {},
          });
      }else{
        con.query("delete from Device_Enrollment where locID = ?", [locID],async  (error, results1) => {
          if(error){
            res.json({
              status: false,
              message: "Error",
              errors: error.message,
              data: {},
              });
        }else{
          con.query("delete from Service_Location where locID = ?", [locID],async  (error, results2) => {
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
                  message: "Service Location Removed Successfully",
                  data: results2,
                });
              }
          });
        }
      });
      }
    });
    // con.query("DELETE Usage_Data, Device_Enrollment, Service_Location\
    // FROM Usage_Data\
    // JOIN Device_Enrollment ON Usage_Data.deID = Device_Enrollment.deID\
    // JOIN Service_Location ON Device_Enrollment.locID = Service_Location.locID\
    // WHERE Device_Enrollment.locID = ?;", [locID],async  (error, results) => {
    //   if(error){
    //     res.json({
    //       status: false,
    //       message: "Error",
    //       errors: error.message,
    //       data: {},
    //       });
    //   }
    //   else{
    //     res.json({
    //       status: true,
    //       message: "Service Location Removed Successfully",
    //       data: results,
    //     });
    //   }
    // });
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

// --- Remove devices to service location w.r.t customer ---
const removeDevice =  async (req, res) => {
  try{
    const {modelID} = req.params;
    con.query("delete from Usage_Data where deID in (select deID from Device_Enrollment where locID = ?)", [locID],async  (error, results0) => { 
      if(error){
        res.json({
          status: false,
          message: "Error",
          errors: error.message,
          data: {},
          });
      }else{
        con.query("delete from Device_Enrollment where locID = ?", [locID],async  (error, results1) => {
          if(error){
            res.json({
              status: false,
              message: "Error",
              errors: error.message,
              data: {},
              });
        }else{
          con.query("delete from Service_Location where locID = ?", [locID],async  (error, results2) => {
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
                  message: "Service Location Removed Successfully",
                  data: results2,
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

// -- Data Analytics --
const dashboard = async (req, res) => {
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

// -- Energy Usage - Monthly based on Location --
const MonthyUsage = async (req, res) => {
  try{
    var query
    var {chart, year, locID} = req.params;

    if(locID==0){
      query=`select sl.locID as Location_ID,MONTH(ud.data_timestamp) as month,\
      YEAR(ud.data_timestamp) as year,\
      SUM(ud.energy_used * ec.price) as y_axis,\
      SUM(ud.energy_used) as total_energy_used\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      inner join Customers c on c.custID = sl.custID \
      inner join Energy_Cost_Backup ec on ec.zipcode = sl.zipcode and \
      DATE_FORMAT(ec.time_loc, '%Y-%m-%d %H:00:00') = DATE_FORMAT(ud.data_timestamp, '%Y-%m-%d %H:00:00')\
      where c.custID=${req.user.custID} and YEAR(ud.data_timestamp)=?\
      group by Location_ID,month,year order by year,month;`
      con.query(query,[year],async (error, results) => {
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
            message: "Results fetched Successfully",
            deviceData: results
          });
        }
      });
    }else{
      if(chart == 0){ // price for service location
        query="select sl.locID as Location_ID,MONTH(ud.data_timestamp) as month,\
        YEAR(ud.data_timestamp) as year,\
        SUM(ud.energy_used * ec.price) as y_axis,\
        SUM(ud.energy_used) as total_energy_used\
        from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
        inner join Service_Location sl on sl.locID = de.locID\
        inner join Energy_Cost_Backup ec on ec.zipcode = sl.zipcode and \
        DATE_FORMAT(ec.time_loc, '%Y-%m-%d %H:00:00') = DATE_FORMAT(ud.data_timestamp, '%Y-%m-%d %H:00:00')\
        WHERE YEAR(ud.data_timestamp)=?\
        group by Location_ID,month,year order by year,month;"
      }else if(chart==1){ // Energy for service location
        query="select\
        sl.locID as Location_ID,MONTH(ud.data_timestamp) as month,\
        YEAR(ud.data_timestamp) as year,\
        SUM(ud.energy_used) as y_axis\
        from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
        inner join Service_Location sl on sl.locID = de.locID\
        where YEAR(ud.data_timestamp) = ?\
        group by Location_ID,month,year order by year,month;"
      }else if(chart==2){ // applicance based - energy
        query="select\
        sl.locID as Location_ID,MONTH(ud.data_timestamp) as month,\
        dm.deviceType x_axis,\
        YEAR(ud.data_timestamp) as year,SUM(ud.energy_used) as y_axis\
        from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
        inner join Service_Location sl on sl.locID = de.locID\
        inner join Device_Models dm on dm.modelID = de.modelID\
        where YEAR(ud.data_timestamp) = ? and MONTH(ud.data_timestamp)=1\
        group by Location_ID,month,year,x_axis order by month,year,x_axis;"
      }else if(chart==3){ // applicance based - price
        query=`select\
        sl.locID as Location_ID,MONTH(ud.data_timestamp) as month,\
        dm.deviceType x_axis,\
        SUM(ud.energy_used * ec.price) as y_axis\
        from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
        inner join Service_Location sl on sl.locID = de.locID\
        inner join Device_Models dm on dm.modelID = de.modelID\
        inner join Energy_Cost_Backup ec on ec.zipcode = sl.zipcode and \
        DATE_FORMAT(ec.time_loc, '%Y-%m-%d %H:00:00') = DATE_FORMAT(ud.data_timestamp, '%Y-%m-%d %H:00:00')\
        WHERE YEAR(ud.data_timestamp) = ? and MONTH(ud.data_timestamp)=1\
        group by Location_ID,month,x_axis order by month,x_axis;`
      }
  
    con.query(query,[year],async (error, results) => {
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
          message: "Results fetched Successfully",
          deviceData: results.filter(function (n){
            return n.Location_ID==locID;
        })
        });
      }
    });
  }
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
    var query;
    var {chart, year, month, locID} = req.params;
    if(chart==0){ //price
      query = "select DAY(ud.data_timestamp) as day,sl.locID,\
      SUM(ud.energy_used * ec.price) as y_axis\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      inner join Energy_Cost_Backup ec on ec.zipcode = sl.zipcode and \
      DATE_FORMAT(ec.time_loc, '%Y-%m-%d %H:00:00') = DATE_FORMAT(ud.data_timestamp, '%Y-%m-%d %H:00:00')\
      where Month(ud.data_timestamp) = ? and YEAR(ud.data_timestamp)=?\
      group by day,sl.locID order by day;"
    }else if(chart==1){ //energy
      query = "select DAY(ud.data_timestamp) as day,sl.locID,\
      SUM(ud.energy_used) as y_axis\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      where Month(ud.data_timestamp) = ? and YEAR(ud.data_timestamp)=?\
      group by day,sl.locID order by day;"
    }

    con.query(query,[month,year],async (error, results) => {
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
          message: "Results fetched Successfully",
          deviceData: results.filter(function (n){
            return n.locID==locID;
        })
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
    var query,{chart,locID} = req.params;
    if(chart== 0){ // Price - Yearly 
      query="select\
      sl.locID as Location_ID,\
      YEAR(ud.data_timestamp) as year,\
      SUM(ud.energy_used * ec.price) as y_axis,\
      SUM(ud.energy_used) as total_energy_used\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      inner join Energy_Cost_Backup ec on ec.zipcode = sl.zipcode and \
      DATE_FORMAT(ec.time_loc, '%Y-%m-%d %H:00:00') = DATE_FORMAT(ud.data_timestamp, '%Y-%m-%d %H:00:00')\
      group by Location_ID,year order by year;"
    }else if(chart==1){ // Energy Usage - Yearly
      query = "select\
      sl.locID as Location_ID,\
      YEAR(ud.data_timestamp) as year,\
      SUM(ud.energy_used) as y_axis\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      group by Location_ID,year order by year;"
    }else if(chart==2){ // Price - Monthly Based on model and location
      query="select\
      sl.locID as Location_ID,YEAR(ud.data_timestamp) as year_occur,\
      dm.deviceType x_axis,\
      SUM(ud.energy_used * ec.price) as y_axis\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      inner join Device_Models dm on dm.modelID = de.modelID\
      inner join Energy_Cost_Backup ec on ec.zipcode = sl.zipcode and \
      DATE_FORMAT(ec.time_loc, '%Y-%m-%d %H:00:00') = DATE_FORMAT(ud.data_timestamp, '%Y-%m-%d %H:00:00')\
      where  YEAR(ud.data_timestamp) = 2022\
      group by Location_ID,year_occur,device_type order by year_occur,device_type;"
    }else if(chart==3){ // Energy - Monthly Based on model and location
      query = "select sl.locID as Location_ID,YEAR(ud.data_timestamp) as year_occur,\
      dm.deviceType x_axis,\
      SUM(ud.energy_used) as y_axis\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Device_Models dm on dm.modelID = de.modelID\
      inner join Service_Location sl on sl.locID = de.locID\
      where YEAR(ud.data_timestamp) = 2022\
      group by Location_ID,year_occur,device_type order by year_occur,device_type;"
    }
    
    con.query(query,async (error, results) => {
      if(error){
        res.json({
          status: false,
          message: "Error",
          errors: error.message,
          data: {},
          });
      }
      else{
        if(chart==0 || chart==1){
          results.push({
            "Location_ID": parseInt(locID),
            "year": 2020,
            "y_axis": 308.2894,
            "total_energy_used": 1711.09
        });
        results.sort(function(a, b) {
          return a.year - b.year;
      });
        }
        res.json({
          status: true,
          message: "Devices fetched Successfully",
          deviceData: results.filter(function (n){
            return n.Location_ID==locID;
        }),
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

// -- Quick Analysis -- 
const wowPage = async (req, res) => {
  var {year} = req.params;
  try{
    con.query("select sl.locID as Location_ID,MONTH(ud.data_timestamp) as month,\
      YEAR(ud.data_timestamp) as Year_occur,\
      SUM(ud.energy_used * ec.price) as y_axis,\
      SUM(ud.energy_used) as total_energy_used\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      inner join Energy_Cost_Backup ec on ec.zipcode = sl.zipcode and \
      DATE_FORMAT(ec.time_loc, '%Y-%m-%d %H:00:00') = DATE_FORMAT(ud.data_timestamp, '%Y-%m-%d %H:00:00')\
      WHERE YEAR(ud.data_timestamp)=?\
      group by Location_ID,month,Year_occur order by year_occur,month;",[year],async (error, results) => {
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
  wowPage
};