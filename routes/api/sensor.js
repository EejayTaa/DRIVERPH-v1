const router = require("express").Router();
const Sensor = require("../../models/Sensor");
const Vehicle = require("../../models/Vehicle");
const multer = require("multer");
const date = require("../../config/date");
const auth = require("../../middleware/auth");
const logFiles = require("../../middleware/logFiles");
const fs = require("fs");

// @Route POST api/sensor/logfiles/:vehicle_id
// @Desc Get logfiles from the truck
// @Access Public

router
  .route("/logfiles/:vehicle_id")
  .post(logFiles.createFolderForLogFiles, async (req, res) => {
    const vehicle_id = req.params.vehicle_id;
    try {
      const findVehicleId = await Vehicle.findOne({
        vehicle_id: vehicle_id,
      }).populate(["sensory_data", "assigned_driver"]);
      if (!findVehicleId) {
        return res.status(404).json({ msg: "Vehicle id is not found." });
      }

      logFiles.fileUploadForLogFiles(req, res, (error) => {
        if (error instanceof multer.MulterError) {
          // A Multer error occurred when uploading.
          console.error(error);
          return res.status(500).json({
            error: error,
          });
        } else if (error) {
          console.error(error);
          return res.status(500).json({
            error: error,
          });
        }

        if (!req.files[0]) {
          return res.status(404).json({
            error: {
              message: "Log file does not exist.",
              method: req.method,
              field: req.field,
              url: req.originalUrl,
              status: "Failed",
            },
          });
        }

        let assignedDriver = "";
        let dateAssigned = "";
        let company = "";
        if (findVehicleId.assigned_driver.length <= 0) {
          console.error({
            error: {
              message: `Vehicle ${findVehicleId.vehicle_id} with plate number: ${findVehicleId.plate_number} has no assigned driver.`,
            },
          });
          assignedDriver = "";
          dateAssigned = "";
          company = "";
        } else {
          assignedDriver =
            findVehicleId.assigned_driver[0].first_name +
            " " +
            findVehicleId.assigned_driver[0].last_name;
          dateAssigned = findVehicleId.assigned_driver[0].date;
          company = findVehicleId.assigned_driver[0].company;
        }

        fs.readFile(req.files[0].path, (err, data) => {
          if (err) {
            return res.status(500).json({
              msg: `Could not upload the file:${err}`,
            });
          }
          let content = data.toString("utf8").trim().split("\n");
          let imgFile = "";
          let imgPath = "";
          let imgcontentType = "";

          if (req.files[1]) {
            imgFile = req.files[1].originalname;
            imgPath = req.files[1].path;
            imgcontentType = req.files[1].mimetype;
            console.log({
              msg: {
                img: imgFile,
                contentType: imgPath,
                path: imgcontentType,
                status: "Success",
              },
            });
          }
          logFiles.getContentValue(content).then(async (result) => {
            const convertTimeStamp = new Date(result[1]);

            const sensorDate = `${
              convertTimeStamp.getMonth() + 1
            }/${convertTimeStamp.getFullYear()}/${convertTimeStamp.getDate()}`;

            const sensorTime = convertTimeStamp.toLocaleString("en-US", {
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: true,
            });


            /* const sensorTimeFinal = `${convertTimeStamp.getUTCHours()+8}:${convertTimeStamp.getUTCMinutes()}:${convertTimeStamp.getUTCSeconds()} ` */
            const sensorTimeFinal = convertTimeStamp.toLocaleString("en-US", {
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: true,
            });



            const serverDateTimestamp =  new Date();

            const serverDate = `${
              serverDateTimestamp.getMonth() + 1
            }/${serverDateTimestamp.getFullYear()}/${serverDateTimestamp.getDate()}`;

            const serverTimeFinal = serverDateTimestamp.toLocaleString("en-US", {
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: true,
            });

            const server_date =  serverDate + " " + serverTimeFinal;

            console.log(server_date);

            const sensoryData = new Sensor({
              server_date: server_date,
              assigned_driver: assignedDriver,
              date_assigned: dateAssigned,
              company: company,
              plate_number: findVehicleId.plate_number,
              sensor_date: sensorDate + " " + sensorTimeFinal,
              utc_time: result[2],
              gyro_sensor_acceleration_x: result[3],
              gyro_sensor_acceleration_y: result[4],
              gyro_sensor_acceleration_z: result[5],
              gyro_sensor_rotation_x: result[6],
              gyro_sensor_rotation_y: result[7],
              gyro_sensor_rotation_z: result[8],
              ultrasonic_sensor: result[9],
              sound_sensor: result[10],
              alcohol_sensor: result[11],
              gyro_sensor_temperature: result[12],
              latitude: parseFloat(result[13]),
              longitude: parseFloat(result[14]),
              min_gps_speed: result[15],
              max_gps_speed: result[16],
              img_filename: imgFile,
              img_filepath: imgPath,
              img_contentType: imgcontentType,
              log_filename: req.files[0].originalname,
              log_filepath: req.files[0].path,
              log_contentType: req.files[0].mimetype,
              status_1: result[17],
              status_2: result[18],
              status_3: result[19],
              status_4: "not-validated",
            });

            const gpsSensoryDataResponse = {
              GPS: [
                {
                  lat: parseFloat(result[13]),
                  lng: parseFloat(result[14]),
                },
              ],
            };
            const gyroSensoryDataResponse = {
              Acceleration: [
                {
                  date: sensorDate + " " + sensorTime,
                  value: result[3],
                  category: "Acceleration X",
                },
                {
                  date: sensorDate + " " + sensorTime,
                  value: result[4],
                  category: "Acceleration Y",
                },
                {
                  date: sensorDate + " " + sensorTime,
                  value: result[5],
                  category: "Acceleration Z",
                },
              ],
              Rotation: [
                {
                  date: sensorDate + " " + sensorTime,
                  value: result[6],
                  category: "Rotation X",
                },
                {
                  date: sensorDate + " " + sensorTime,
                  value: result[7],
                  category: "Rotation Y",
                },
                {
                  date: sensorDate + " " + sensorTime,
                  value: result[8],
                  category: "Rotation Z",
                },
              ],
            };

            await sensoryData.save();
            findVehicleId.sensory_data.push(sensoryData);
            await findVehicleId.save();

            req.io.sockets.emit(`${req.params.vehicle_id}`, {
              data: sensoryData,
              gyro_data: gyroSensoryDataResponse,
              gps_data: gpsSensoryDataResponse,
            });

            console.log(sensoryData);


            req.io.sockets.emit(`trackAllVehicle`, {
              data: sensoryData,
              gyro_data: gyroSensoryDataResponse,
              gps_data: gpsSensoryDataResponse,
            });

            res.status(201).json({
              message: "File is successfully submitted.",
              log_file: req.files[0].originalname,
              image_file: imgFile,
              error: false,
            });
          });
        });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Error: Server error" });
    }
  });

module.exports = router;
