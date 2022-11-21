const router = require("express").Router();
const mongoose = require("mongoose");
const Vehicle = require("../../models/Vehicle");
const Sensor = require("../../models/Sensor");
const ObjectId = mongoose.Types.ObjectId;
const AssignedDriver = require("../../models/AssignedDriver");
const HistoryAssignedDriver = require("../../models/HistoryAssignedDriver");
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const crypto = require("crypto");
const fs = require("fs");
const { DateTime, Settings } = require("luxon");
Settings.defaultZoneName = "Asia/Manila";
const axios = require("axios");
const pdf = require("html-pdf");
const path = require("path");
const pdfTemplate = require("../../documents");

// @route GET api/trucks/createTrucks
// @desc Create a truck
// @access Private

router
  .route("/createTruck")
  .post(
    [
      auth,
      [
        check("vehicleType", "Vehicle type is required.").not().isEmpty(),
        check("plateNumber", "Plate number is required.")
          .not()
          .isEmpty()
          .isLength({ min: 1, max: 7 })
          .withMessage("Plate number should not be greater than 7 characters."),
      ],
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      try {
        const { plateNumber, vehicleType } = req.body;
        const ifPlateNumExists = await Vehicle.findOne({
          plate_number: plateNumber,
        });
        if (ifPlateNumExists) {
          return res
            .status(400)
            .json({ errors: [{ msg: "Plate number already exists." }] });
        }
        const id = crypto.randomBytes(16).toString("hex");
        const truck = new Vehicle({
          vehicle_id: id,
          vehicle_type:
            vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1),
          plate_number: plateNumber.toUpperCase().replace(/ /g, ""),
        });

        await truck.save();
        const trucks = await Vehicle.find().populate("assigned_driver");

        res.status(201).json(trucks);
      } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Error: Server error" });
      }
    }
  );

// @route GET api/trucks/getTrucks
// @desc Get all trucks
// @access Private

router.route("/getTrucks").get(auth, async (req, res) => {
  try {
    const trucks = await Vehicle.find().populate("assigned_driver");
    if (!trucks) {
      return res.status(404).json({ msg: "There is no trucks available." });
    }
    res.status(200).json(trucks);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error: Server error" });
  }
});

router.route("/getSpecificDay/:truck_id/:date_input").get(async (req, res) => {
  try {
    let gyroMultileGraph = (filteredDate) => {
      let gyroAcceleration = [];
      let gyroRotation = [];

      filteredDate.sensory_data.map((val) => {
        gyroAcceleration.push(
          {
            date: val.date,
            value: val.gyro_sensor_acceleration_x,
            category: "Acceleration X",
          },
          {
            date: val.date,
            value: val.gyro_sensor_acceleration_y,
            category: "Acceleration Y",
          },
          {
            date: val.date,
            value: val.gyro_sensor_acceleration_z,
            category: "Acceleration Z",
          }
        );

        gyroRotation.push(
          {
            date: val.date,
            value: val.gyro_sensor_rotation_x,
            category: "Rotation X",
          },
          {
            date: val.date,
            value: val.gyro_sensor_rotation_y,
            category: "Rotation Y",
          },
          {
            date: val.date,
            value: val.gyro_sensor_rotation_z,
            category: "Rotation Z",
          }
        );
      });
      return res.status(200).send({
        data: filteredDate,
        acceleration: gyroAcceleration,
        rotation: gyroRotation,
      });
    };

    const dayStart = new Date(req.params.date_input);
    const dayEnd = new Date(req.params.date_input);

    const filteredDate = await Vehicle.findOne({
      vehicle_id: req.params.truck_id,
    }).populate({
      path: "sensory_data",
      match: {
        date: {
          $gte: dayStart.toISOString().substr(0, 10) + "T00:00:59.019Z",
          $lte: dayEnd.toISOString().substr(0, 10) + "T23:59:59.019Z",
        },
      },
    });

    gyroMultileGraph(filteredDate);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error: Server errors" });
  }
});
// @route DELETE api/trucks/deleteTruck/:truck_id
// @desc  Delete truck by id
// @access Private

router.route("/deleteTruck/:truck_id").delete(auth, async (req, res) => {
  try {
    const findTruck = await Vehicle.findOneAndRemove({
      vehicle_id: req.params.truck_id,
    });
    if (!findTruck) {
      return res.status(404).json({ msg: "Vehicle id not found." });
    }
    fs.rm(`logfiles/${req.params.truck_id}`, { recursive: true }, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });

    const truck = await Vehicle.find().populate();
    res.status(200).json(truck);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error: Server error" });
  }
});

// @route POST api/trucks/assignDriver/:truck_id
// @desc  Assign driver to truck
// @access Private

router.route("/assignDriver/:truck_id").post(auth, async (req, res) => {
  try {
    const truck = await Vehicle.findOne({ vehicle_id: req.params.truck_id });
    if (!truck) {
      return res.status(404).json({ msg: "Vehicle id not found." });
    }

    const assignDriver = new AssignedDriver({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      company: req.body.company,
    });

    await assignDriver.save();

    truck.assigned_driver.push(assignDriver);

    await truck.save();
    const trucks = await Vehicle.find().populate("assigned_driver");
    res.status(201).json(trucks);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error: Server error" });
  }
});

// @route GET api/trucks/getSpecificTruck/:truck_id
// @desc  Get specific truck by id
// @access Private

router.route("/getSpecificTruck/:truck_id").get(auth, async (req, res) => {
  try {
    const truck = await Vehicle.findOne({
      vehicle_id: req.params.truck_id,
    }).populate(["truck_gps_data", "sensory_data", "assigned_driver"]);
    if (!truck) {
      return res.status(404).json({ msg: "Vehicle id not found." });
    }
    res.status(200).json(truck);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error: Server error" });
  }
});

//@ route UPDATE
router
  .route("/updateExistingTruck/:truck_id")
  .put(
    [
      check("plate_number", "Plate Number is required.")
        .not()
        .isEmpty()
        .isLength({ min: 1, max: 7 })
        .withMessage("Plate number should not be greater than 7 characters."),
      check("vehicle_type", "Vehicle Type is required.").not().isEmpty(),
    ],
    async (req, res) => {
      try {
        const truck = await Vehicle.findOneAndUpdate(
          { vehicle_id: req.params.truck_id },
          {
            plate_number: req.body.plate_number,
            vehicle_type: req.body.vehicle_type,
          },
          { new: true }
        );
        const trucks = await Vehicle.find().populate();
        console.log(trucks);
        res.status(200).send(trucks);
      } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Error: Server error" });
      }
    }
  );

// @route DELETE api/trucks/deleteAssignedDriver/:truck_id/:assigned_driver_id
// @desc  Delete Assigned Driver by id
// @access Private

router
  .route("/deleteAssignedDriver/:truck_id/:assigned_driver_id")
  .delete(auth, async (req, res) => {
    try {
      const findVehicle = await Vehicle.findOne({
        vehicle_id: req.params.truck_id,
      }).populate("assigned_driver");

      const historyAssignedDriver = new HistoryAssignedDriver({
        first_name: findVehicle.assigned_driver[0].first_name,
        last_name: findVehicle.assigned_driver[0].last_name,
        company: findVehicle.assigned_driver[0].company,
        plate_number: findVehicle.plate_number,
        startDate: findVehicle.assigned_driver[0].date,
      });

      await historyAssignedDriver.save();
      findVehicle.history_assigned_driver.push(historyAssignedDriver);
      await findVehicle.save();
      const assignedDriver = await AssignedDriver.findByIdAndRemove(
        req.params.assigned_driver_id
      );
      if (!assignedDriver) {
        return res.status(404).json({ msg: "Assigned Driver not found." });
      }
      const vehicle = await Vehicle.findOne({
        vehicle_id: req.params.truck_id,
      });
      if (!vehicle) {
        return res.status(404).json({ msg: "Vehicle id not found." });
      }
      vehicle.assigned_driver.shift();
      await vehicle.save();
      const truck = await Vehicle.find().populate("assigned_driver");
      res.status(200).json(truck);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Error: Server error" });
    }
  });

router.route("/getAllAssignedDriver").get(async (req, res) => {
  try {
    const assignedDriversHistory = await HistoryAssignedDriver.find();
    res.status(200).json(assignedDriversHistory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error: Server error" });
  }
});

// @route GET api/trucks/getAllSensoryData/:truck_id/
// @desc Gets all sensory data
// @access Private

router.route("/getAllSensoryData/:truck_id/").get(async (req, res) => {
  try {
    const allData = await Vehicle.findOne({
      vehicle_id: req.params.truck_id,
    }).populate({
      path: "sensory_data",
    });
    res.status(200).json(allData);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Error: Server error" });
  }
});

// @route GET api/trucks/getSensoryDataByFilteredDate/:truck_id/:date_filter
// @desc Get sensory data based on filtered date.
// @access Private

router
  .route("/getSensoryDataByFilteredDate/:truck_id/:date_filter")
  .get(auth, async (req, res) => {
    try {
      let gyroMultileGraph = (filteredDate) => {
        let gyroAcceleration = [];
        let gyroRotation = [];

        filteredDate.sensory_data.map((val) => {
          gyroAcceleration.push(
            {
              date: val.date,
              value: val.gyro_sensor_acceleration_x,
              category: "Acceleration X",
            },
            {
              date: val.date,
              value: val.gyro_sensor_acceleration_y,
              category: "Acceleration Y",
            },
            {
              date: val.date,
              value: val.gyro_sensor_acceleration_z,
              category: "Acceleration Z",
            }
          );

          gyroRotation.push(
            {
              date: val.date,
              value: val.gyro_sensor_rotation_x,
              category: "Rotation X",
            },
            {
              date: val.date,
              value: val.gyro_sensor_rotation_y,
              category: "Rotation Y",
            },
            {
              date: val.date,
              value: val.gyro_sensor_rotation_z,
              category: "Rotation Z",
            }
          );
        });
        return res.status(200).send({
          data: filteredDate,
          acceleration: gyroAcceleration,
          rotation: gyroRotation,
        });
      };

      if (req.params.date_filter == "1D") {
        const filteredDate = await Vehicle.findOne({
          vehicle_id: req.params.truck_id,
        }).populate({
          path: "sensory_data",
          match: {
            date: {
              $gte: DateTime.local().plus({ days: -1 }).toISO(),
              $lte: DateTime.local().toISO(),
            },
          },
        });

        gyroMultileGraph(filteredDate);
      } else if (req.params.date_filter == "7D") {
        const filteredDate = await Vehicle.findOne({
          vehicle_id: req.params.truck_id,
        }).populate({
          path: "sensory_data",
          match: {
            date: {
              $gte: DateTime.local().plus({ days: -7 }).toISO(),
              $lte: DateTime.local().toISO(),
            },
          },
        });
        gyroMultileGraph(filteredDate);
      } else if (req.params.date_filter == "1M") {
        const filteredDate = await Vehicle.findOne({
          vehicle_id: req.params.truck_id,
        }).populate({
          path: "sensory_data",
          match: {
            date: {
              $gte: DateTime.local().plus({ months: -1 }).toISO(),
              $lte: DateTime.local().toISO(),
            },
          },
        });
        gyroMultileGraph(filteredDate);
      } else if (req.params.date_filter == "3M") {
        const filteredDate = await Vehicle.findOne({
          vehicle_id: req.params.truck_id,
        }).populate({
          path: "sensory_data",
          match: {
            date: {
              $gte: DateTime.local().plus({ months: -3 }).toISO(),
              $lte: DateTime.local().toISO(),
            },
          },
        });
        gyroMultileGraph(filteredDate);
      } else if (req.params.date_filter == "1Y") {
        const filteredDate = await Vehicle.findOne({
          vehicle_id: req.params.truck_id,
        }).populate({
          path: "sensory_data",
          match: {
            date: {
              $gte: DateTime.local().plus({ months: -12 }).toISO(),
              $lte: DateTime.local().toISO(),
            },
          },
        });

        gyroMultileGraph(filteredDate);
      } else {
        return res.status(400).send({ msg: "Invalid Parameter." });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Error: Server error" });
    }
  });

// @route GET

// @desc Get long lat date
// @access Private

router.route("/pathDate/:truck_id").get(auth, async (req, res) => {
  try {
    const pathDate = await Vehicle.find({
      vehicle_id: req.params.truck_id,
    }).populate({ path: "sensory_data", select: "date" });
    if (!pathDate) {
      return res.status(404).json({ msg: "Vehicle id not found." });
    }

    //console.log(pathDate);

    var arrDate = [];
    var finalArrDate = [];

    for (let i = 0; i < pathDate[0].sensory_data.length; i++) {
      arrDate[i] = new Date(
        pathDate[0].sensory_data[i].date.getTime() - 8 * 60 * 60 * 1000
      )
        .toString()
        .substr(3, 12);

      console.log(arrDate[i]);
    }
    //console.log(arrDate);

    //(DATE.getTime() + 8 * 60 * 60 * 1000)
    const uniqueDate = Array.from(new Set(arrDate));
    //console.log(uniqueDate);

    const getRandomNumber = () => {
      return Math.random().toString().substring(2, 8);
    };

    for (var i = 0; i < uniqueDate.length; i++) {
      finalArrDate.push({
        key: getRandomNumber(),
        date: uniqueDate[i],
      });
    }

    res.status(200).json(finalArrDate);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error: Server error" });
  }
});

// @route GET api/trucks/pathByDay/:truck_id/:path_day
// @desc Get long lat data per date
// @access Private

router.route("/pathByDay/:truck_id/:path_day").get(auth, async (req, res) => {
  try {
    const { truck_id, path_day } = req.params;
    const DATE = new Date(path_day);

    DATE.setTime(DATE.getTime() + 8 * 60 * 60 * 1000);

    const finalDate = DATE.toISOString().substr(0, 10) + "T23:59:59.019Z";

    console.log(finalDate);

    const pathRecord = await Vehicle.find({
      vehicle_id: truck_id,
    }).populate({
      path: "sensory_data",
      select: ["date", "latitude", "longitude"],
      match: { date: { $gte: DATE, $lte: finalDate } },
    });

    if (!pathRecord) {
      return res.status(404).json({ msg: "Vehicle id not found." });
    }

    let longLat = [];
    const dates = pathRecord.map((data) => {
      return data.sensory_data;
    });

    dates[0].map((val) => {
      longLat.push({
        lat: val.latitude,
        lng: val.longitude,
      });
    });
    console.log(DATE);
    console.log(req.params.path_day);
    res.status(200).send(longLat);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error: Server error" });
  }
});

// @desc Get the duration of time wherein the driver is standby within a certain location
//api/trucks/durationPerDay/:truck_id/date

router.route("/durationPerDay/:truck_id/:path_day").get(async (req, res) => {
  try {
    const { truck_id, path_day } = req.params;

    const DATE = new Date(path_day);

    const finalDate = DATE.toISOString().substr(0, 10) + "T23:59:59.019Z";

    //Gets all sensory data for Specific truck ID
    const pathRecord = await Vehicle.find({
      vehicle_id: truck_id,
    }).populate({
      path: "sensory_data",
      select: ["date", "latitude", "longitude", "max_gps_speed"],
      match: {
        date: { $gte: DATE, $lte: finalDate },
        max_gps_speed: { $lt: 1 },
      },
    });

    const staticDuration = [];

    //Gets all unique longlat record
    const uniqueLong = [
      ...new Set(pathRecord[0].sensory_data.map((item) => item.longitude)),
    ];

    //Loop to get the first and last data of each recorded unique location
    for (let i = 0; i < uniqueLong.length; i++) {
      const dateIndex = [];
      for (let j = 0; j < pathRecord[0].sensory_data.length; j++) {
        if (uniqueLong[i] === pathRecord[0].sensory_data[j].longitude) {
          dateIndex.push(j);
        }
      }

      let totalHours;

      //conditional statement in order to get the static duration for single unique longlat

      if (
        dateIndex[dateIndex.length - 1] + 1 ===
        pathRecord[0].sensory_data.length
      ) {
        totalHours =
          Math.abs(
            pathRecord[0].sensory_data[dateIndex[0]].date -
              pathRecord[0].sensory_data[dateIndex[dateIndex.length - 1]].date
          ) / 36e5;
      } else {
        totalHours =
          Math.abs(
            pathRecord[0].sensory_data[dateIndex[0]].date -
              pathRecord[0].sensory_data[dateIndex[dateIndex.length - 1]].date
          ) / 36e5;
      }

      if (totalHours > 0) {
        staticDuration.push({
          position: {
            lat: pathRecord[0].sensory_data[dateIndex[0]].latitude,
            lng: uniqueLong[i],
          },
          totalHours:
            Math.floor(totalHours) +
            " hours and " +
            Math.floor((totalHours - Math.floor(totalHours)) * 60) +
            " minutes",
        });
      }
    }

    res.status(200).json(staticDuration);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error: Server error" });
  }
});

router.route("/travelDuration/:truck_id/:path_day").get(async (req, res) => {
  try {
    const { truck_id, path_day } = req.params;
    const DATE = new Date(path_day);

    const finalDate = DATE.toISOString().substr(0, 10) + "T23:59:59.019Z";

    const pathRecord = await Vehicle.find({
      vehicle_id: truck_id,
    }).populate({
      path: "sensory_data",
      select: ["date", "latitude", "longitude"],
      match: { date: { $gte: DATE, $lte: finalDate } },
    });

    var totalHours =
      Math.abs(
        pathRecord[0].sensory_data[0].date -
          pathRecord[0].sensory_data[pathRecord[0].sensory_data.length - 1].date
      ) / 36e5;

    res.status(200).send({
      totalHours:
        Math.floor(totalHours) +
        " hours and " +
        Math.floor((totalHours - Math.floor(totalHours)) * 60) +
        " minutes",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error: Server error" });
  }
});

// @route GET api/trucks/sensoryData/:truck_id/:id
// @desc Get specific sensory data
// @access Private

router.route("/sensoryData/:truck_id/:id").get(auth, async (req, res) => {
  try {
    const findVehicle = await Vehicle.findOne({
      vehicle_id: req.params.truck_id,
    });
    if (!findVehicle) {
      return res.status(404).json({ msg: "Truck not found." });
    }
    const findSensorData = await Sensor.findOne(
      { _id: req.params.id },
      (err) => {
        console.error(err);
        return;
      }
    ).populate();
    res.status(200).send(findSensorData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error: Server error" });
  }
});
// @route PUT api/trucks/validate/:truck_id/:id
// @desc Validate trucks data
// @access Private

router.route("/validate/:truck_id/:id").put(auth, async (req, res) => {
  try {
    const findVehicle = await Vehicle.findOne({
      vehicle_id: req.params.truck_id,
    });
    if (!findVehicle) {
      return res.status(404).json({ msg: "Truck not found." });
    }
    const findSensor = await Sensor.findOneAndUpdate(
      { _id: req.params.id },
      { status_4: req.body.status_4 },
      { new: true },
      (err) => {
        console.error(err);
        return;
      }
    ).populate();

    let list = [
      {
        id: 296,
      },
    ];

    axios
      .post("https://api.driverph.com/api/violationsInformation", {
        Driver_ID: 122, // 91 Ryan Pinca
        Truck_ID: 1,
        violation_list: JSON.stringify(list), // 296 is equal to
        Date_happened: "2022-05-06",
        Time_happened: "10:24:03 Am",
        offense_level: 1,
        status: "Reported",
        ml_violation: 1,
      })
      .then(function (response) {
        // handle success
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(function () {
        // always executed
      });

    res.status(201).json(findSensor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error: Server error" });
  }
});

// @route DELETE api/trucks/deleteSensoryData/:truck_id
// @desc Erase all the sensory data from a specific truck
// @access Private

router.route("/deleteSensoryData/:truck_id").delete(async (req, res) => {
  try {
    const findVehicle = await Vehicle.findOne({
      vehicle_id: req.params.truck_id,
    });
    if (!findVehicle) {
      return res.status(404).json({ msg: "Truck not found." });
    }
    findVehicle.sensory_data = [];
    await findVehicle.save();
    res.status(200).json(findVehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error: Server error" });
  }
});

// @route GET api/trucks/generateReport/:truck_id/:id
// @desc Generated report based on specific sensory data
// @access Private

router.route("/generateReport/:truck_id/:id").get(async (req, res) => {
  try {
    const { truck_id, id } = req.params;
    const customId = crypto.randomBytes(10).toString("hex");

    const findVehicle = await Vehicle.findOne({
      vehicle_id: truck_id,
    }).populate("assigned_driver");

    if (!findVehicle) {
      return res.status(404).json({ msg: "Truck not found." });
    }
    const findSensoryData = await Sensor.findOne({ _id: id });

    //Sensory Data Information
    const {
      img_filepath,
      assigned_driver,
      date_assigned,
      company,
      plate_number,
      sensor_date,
      gyro_sensor_acceleration_x,
      gyro_sensor_acceleration_y,
      gyro_sensor_acceleration_z,
      gyro_sensor_rotation_x,
      gyro_sensor_rotation_y,
      gyro_sensor_rotation_z,
      ultrasonic_sensor,
      sound_sensor,
      alcohol_sensor,
      gyro_sensor_temperature,
      latitude,
      longitude,
      max_gps_speed,
      status_1,
      status_2,
      status_3,
      status_4,
    } = findSensoryData;

    const IMG_URL = `http://13.212.5.204:8000/${img_filepath}`;
    const LOGO = "http://13.212.5.204:8000/documents/driverphlogo.png";
    const DATE = new Date(date_assigned);
    const DATE_ASSIGNED = `${
      DATE.getMonth() + 1
    }/${DATE.getDate()}/${DATE.getFullYear()} ${DATE.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    })}`;

    let alcoholSensorLegend = "";
    let ultrasonicSensorLegend = "";
    let soundSensorLegend = "";

    if (sound_sensor == 0) soundSensorLegend = "Clear";
    else soundSensorLegend = "Detected";

    if (alcohol_sensor < "120") alcoholSensorLegend = "Sober";
    else if (alcohol_sensor >= "120" && alcohol_sensor < "400")
      alcoholSensorLegend = "Drinking";
    else alcoholSensorLegend = "Drunk";

    if (ultrasonic_sensor < 50) ultrasonicSensorLegend = "Too Close";
    else ultrasonicSensorLegend = "Normal";

    await pdf
      .create(
        pdfTemplate(
          plate_number,
          assigned_driver,
          company,
          DATE_ASSIGNED,
          sensor_date,
          gyro_sensor_acceleration_x,
          gyro_sensor_acceleration_y,
          gyro_sensor_acceleration_z,
          gyro_sensor_rotation_x,
          gyro_sensor_rotation_y,
          gyro_sensor_rotation_z,
          sound_sensor,
          ultrasonic_sensor,
          alcohol_sensor,
          gyro_sensor_temperature,
          latitude,
          longitude,
          max_gps_speed,
          status_1,
          status_2,
          status_3,
          status_4,
          IMG_URL,
          LOGO,
          alcoholSensorLegend,
          ultrasonicSensorLegend,
          soundSensorLegend
        ),
        {}
      )
      .toFile(
        `./reports/report-${findVehicle.vehicle_id}-${customId}.pdf`,
        (err) => {
          if (err)
            res.status(400).json({ message: "Cannot generate reports." });
          res
            .status(200)
            .sendFile(
              `${__basedir}/reports/report-${findVehicle.vehicle_id}-${customId}.pdf`
            );
        }
      );
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error: Server error" });
  }
});

module.exports = router;
