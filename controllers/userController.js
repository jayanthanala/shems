const bcrypt = require("bcrypt");
const con = require('../config/dbconfig.js');

// ---- Login Routes ----
const login = async (req, res) => {
  try{
    const { email, password } = req.body;
    con.query("SELECT * FROM Customers WHERE email = ?", [email], async (error, results) => {
      console.log(results[0].email);
      res.json({
        status: true,
        message: "Logged In Successfully",
        data: {"email":req.body.email, "custID":results[0].custID,"name":results[0].firstName},
      });
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
  con.query("INSERT INTO Customers (email, password, firstName, lastName, address, city, state, zip, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [email, hashedPassword, req.body.firstName, req.body.lastName, req.body.address_line, req.body.city, req.body.state, req.body.zipcode],async  (error, results) => {
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
        message: "Registered Successfully",
        data: {},
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
    // const custID = req.user.ID;
    // con.query("INSERT INTO Service_Location (custID, loc_type, address_line, city, state, zipcode, date_tookover, area, num_bed, num_occupants, plabel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [custID, loc_type, address_line, city, state, zipcode, date_tookover, area, num_bed, num_occupants, plabel],async  (error, results) => {
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
    //       status: 200,
    //       message: "Service Location Added Successfully",
    //       data: results,
    //     });
    //   }
    // });
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

// --- Get Device Models ---
const getDevice =  async (req, res) => {
  try{
    con.query("SELECT locID, address_line, city, state, zipcode FROM Service_Location WHERE custID=?",1,async (error, sevlocs) => {
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
    // const custID = req.user.ID;
    res.json({
      status: true,
      message: "Device Models added Successfully",
      devicedata: req.body
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
    con.query("SELECT * FROM Customers WHERE custID=?",[3],async (error, userData) => {
      if(error){
        res.json({
          status: false,
          message: "Error",
          errors: error.message,
          data: {},
          });
      }
      else{
        con.query("SELECT * FROM Service_Location WHERE custID=?",[3],async (error, results) => {
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
    con.query("SELECT * FROM Service_Location WHERE custID=?",1,async (error, results) => {
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
const energyMonthyUsage = async (req, res) => {
  try{
    var query
    var {chart, year, locID} = req.params;

    if(chart== 0){
      // -- Price - Monthly Based on location
      query="select\
      sl.locID as Location_ID,MONTH(ud.data_timestamp) as month,SUM(ud.energy_used * ec.price) as y_axis,\
      SUM(ud.energy_used) as total_energy_used\
      from Usage_Data ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      inner join Energy_Cost ec on ec.zipcode = sl.zipcode and \
      DATE_FORMAT(ec.time_loc, '%Y-%m-%d %H:00:00') = DATE_FORMAT(ud.data_timestamp, '%Y-%m-%d %H:00:00')\
      WHERE sl.locID =?\
      group by Location_ID,month order by month;"
    }else if(chart==2){
      //-- Energy Usage - Monthly based on Location
      query = "select\
      sl.locID as Location_ID, MONTH(ud.data_timestamp) as month, SUM(ud.energy_used) as y_axis\
      from Usage_Data ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      where sl.locID = ?\
      group by Location_ID,month order by month;"
    }else if(chart==1){
      //-- Price - Monthly Based on model and location
      query = "select\
      sl.locID as Location_ID,MONTH(ud.data_timestamp) as month,\
      dm.deviceType device_type,\
      SUM(ud.energy_used * ec.price) as price_monthly\
      from Usage_Data ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      inner join Device_Models dm on dm.modelID = de.modelID\
      inner join Energy_Cost ec on ec.zipcode = sl.zipcode and \
      DATE_FORMAT(ec.time_loc, '%Y-%m-%d %H:00:00') = DATE_FORMAT(ud.data_timestamp, '%Y-%m-%d %H:00:00')\
      where sl.locID = ?\
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
      from Usage_Data ud inner join Device_Enrollment de on ud.deID = de.deID\
      inner join Service_Location sl on sl.locID = de.locID\
      inner join Device_Models dm on dm.modelID = de.modelID\
      where sl.locID = ?\
      group by Location_ID,month,device_type order by month,device_type;"
    }
    con.query(query,[locID],async (error, results) => {
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


module.exports = {
    login,
    signup,
    addLoc,
    addDevice,
    getDevice,
    home,
    getDeviceServLoc,
    energyMonthyUsage,
    dashboard
};