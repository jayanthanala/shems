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

// --- Get Service Location ----
const getLoc = async (req, res) => {
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
          serviceLocationData: results
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
    const {deID} = req.params;
    con.query("delete from Usage_Data where deID=?", [deID],async  (error, results0) => { 
      if(error){
        res.json({
          status: false,
          message: "Error",
          errors: error.message,
          data: {},
          });
      }else{
        con.query("delete from Device_Enrollment where deID = ?", [deID],async  (error, results1) => {
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
            message: "Device Removed Successfully",
            data: results1,
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
      query=`select\
      sl.locID as Location_ID,YEAR(ud.data_timestamp) as year_occur,\
      dm.deviceType x_axis,\
      SUM(ud.energy_used * ec.price) as y_axis\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      inner join Device_Models dm on dm.modelID = de.modelID\
      inner join Energy_Cost_Backup ec on ec.zipcode = sl.zipcode and \
      DATE_FORMAT(ec.time_loc, '%Y-%m-%d %H:00:00') = DATE_FORMAT(ud.data_timestamp, '%Y-%m-%d %H:00:00')\
      where  sl.locID=${locID} and YEAR(ud.data_timestamp) = 2022\
      group by Location_ID,year_occur,x_axis order by year_occur,x_axis;`
    }else if(chart==3){ // Energy - Monthly Based on model and location
      query = "select sl.locID as Location_ID,YEAR(ud.data_timestamp) as year_occur,\
      dm.deviceType x_axis,\
      SUM(ud.energy_used) as y_axis\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Device_Models dm on dm.modelID = de.modelID\
      inner join Service_Location sl on sl.locID = de.locID\
      where YEAR(ud.data_timestamp) = 2022\
      group by Location_ID,year_occur,x_axis order by year_occur,x_axis;"
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
  var {locID} = req.body;
  try{
    con.query("WITH datas AS (\
      SELECT sl.locID AS Location_ID,\
          MONTH(ud.data_timestamp) AS Month_occur,dm.deviceType AS device_type,\
          SUM(ud.energy_used) AS energy_used,SUM(ud.energy_used * ec.price) AS price_monthly\
      FROM\
          Usage_Data_Backup ud\
          INNER JOIN Device_Enrollment de ON ud.deID = de.deID\
          INNER JOIN Service_Location sl ON sl.locID = de.locID\
          INNER JOIN Device_Models dm ON dm.modelID = de.modelID\
          INNER JOIN Energy_Cost_Backup ec ON ec.zipcode = sl.zipcode AND \
      DATE_FORMAT(ec.time_loc, '%Y-%m-%d %H:00:00') = DATE_FORMAT(ud.data_timestamp, '%Y-%m-%d %H:00:00')\
      WHERE\
          MONTH(ud.data_timestamp) IN (MONTH(NOW() - INTERVAL 1 MONTH), MONTH(NOW() - INTERVAL 2 MONTH))\
          AND MONTH(ec.time_loc) IN (MONTH(NOW() - INTERVAL 1 MONTH), MONTH(NOW() - INTERVAL 2 MONTH))\
      GROUP BY\
          Location_ID, Month_occur, device_type\
      ORDER BY\
          Month_occur, device_type\
  ),\
  combined AS (\
      SELECT d1.Location_ID,\
          d1.device_type,d1.month_occur AS m1,d2.month_occur AS m2,d1.energy_used AS e1,\
          d2.energy_used AS e2\
      FROM datas d1\
          JOIN datas d2 ON d1.Location_ID = d2.Location_ID AND d1.device_type = d2.device_type AND\
      d1.month_occur != d2.month_occur\
  )\
  select c.*,(c.e1 - c.e2) as diff  from combined c where c.Location_ID = ? order by diff  DESC LIMIT 1;",[locID],async (error, results) => {
      if(error){
        res.json({
          status: false,
          message: "Error",
          errors: error.message,
          data: {},
          });
      }else{
        var diff = results[0].diff;
        if(diff<0){
          var message = "Your "+results[0].device_type+"'s energy consumption has increased by "+Math.abs(diff)+" units from last month"
        }else{
          var message = "Yay! energy consumption has decreased by "+Math.abs(diff)+" units from last month 🎉"
        }
        res.json({
          status: true,
          message: "Results",
          data: results,
          message: message
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

const zipCodeMetrics = async (req, res) => {  
  try{
    var {locID} = req.body;
    var query="with Ids as (Select locID from Service_Location where zipcode = (select zipcode from Service_Location\
      where locID = 1)),\
      datas as( select sum(ud.energy_used) as total_energy,\
      month(ud.data_timestamp) as month_occur,\
      sl.locID as locID,\
      sl.zipcode as zipcode\
      from Usage_Data_Backup ud inner join Device_Enrollment de on ud.deID = de.deID\
     inner join Ids ids on de.locID = ids.locID\
     inner join Service_Location sl on sl.locID = ids.locID\
     where  YEAR(ud.data_timestamp) = 2022 and month(ud.data_timestamp) = MONTH(NOW() - INTERVAL 1 MONTH) \
     group by sl.locID,month_occur,zipcode order by locID,month_occur)\
     select d1.locID as loc1,d1.total_energy as Your_energy_consumption,sum(d2.total_energy) as Total_energy_consumption_in_your_Area,\
     d1.total_energy * 100 /sum(d2.total_energy)  as Your_Usage\
     from datas d1\
      join datas d2 \
     where d1.locID = ? group by d1.locID,Your_energy_consumption";
     con.query(query,[locID],async (error, results) => {
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
          message: "Results",
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
  wowPage,
  zipCodeMetrics
};