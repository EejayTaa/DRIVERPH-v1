const util = require('util');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

let getContentValue = content => {

  return new Promise((res, rej) => {
    let latest_lat = null;
    let latest_long = null;
    let min_gps_speed = 0;
    let max_gps_speed = 0;

    let min_ultrasonic = 0;

    let max_gyro_x = 0;
    let max_gyro_y = 0;
    let max_gyro_z = 0;

    let max_gyro_rot_x = 0;
    let max_gyro_rot_y = 0;
    let max_gyro_rot_z = 0;

    let max_sound_sensor = 0;
    let max_alchohol = 0;

    let max_gyro_temp = 0;

    let ctr = 0;

    let sensor_time = null;
    let utc_time = null;

    let status_1 = "no_sign";
    let status_2 = "good";
    let status_3 = null;


    try {
      for (let x = 0; x < content.length; x++) {
        let data = content[x].trim().split(',');

        ctr = parseInt(data[0]);
        sensor_time = parseInt(data[1]);
        utc_time = data[2];

        let gyro_x = parseFloat(data[3]);
        let gyro_y = parseFloat(data[4]);
        let gyro_z = parseFloat(data[5]);

        if (Math.abs(gyro_x) > Math.abs(max_gyro_x)) {
          max_gyro_x = gyro_x;
        }

        if (Math.abs(gyro_y) > Math.abs(max_gyro_y)) {
          max_gyro_y = gyro_y;
        }

        if (Math.abs(gyro_z) > Math.abs(max_gyro_z)) {
          max_gyro_z = gyro_z;
        }

        let gyro_rot_x = parseFloat(data[6]);
        let gyro_rot_y = parseFloat(data[7]);
        let gyro_rot_z = parseFloat(data[8]);

        if (Math.abs(gyro_rot_x) > Math.abs(max_gyro_rot_x)) {
          max_gyro_rot_x = gyro_rot_x;
        }

        if (Math.abs(gyro_rot_y) > Math.abs(max_gyro_rot_y)) {
          max_gyro_rot_y = gyro_rot_y;
        }

        if (Math.abs(gyro_rot_z) > Math.abs(max_gyro_rot_z)) {
          max_gyro_rot_z = gyro_rot_z;
        }

        min_ultrasonic = parseFloat(data[9]);

        // if (ultrasonic && ultrasonic < min_ultrasonic) {
        //   min_ultrasonic = ultrasonic;
        // }

        let sound_sensor = parseFloat(data[10]);
        let alchohol = parseFloat(data[11]);
        let gyro_temp = parseFloat(data[12]);
        if (Math.abs(sound_sensor) > Math.abs(max_sound_sensor)) {
          max_sound_sensor = sound_sensor;
        }
        if (Math.abs(alchohol) > Math.abs(max_alchohol)) {
          max_alchohol = alchohol;
        }
        if (Math.abs(gyro_temp) > Math.abs(max_gyro_temp)) {
          max_gyro_temp = gyro_temp;
        }
        let latitude = data[13];
        let longitude = data[14];

        let gps_speed = data[15];

        if (latitude) {
          latest_lat = latitude;
        }
        if (longitude) {
          latest_long = longitude;
        }
        if (gps_speed) {
          if (Math.abs(gps_speed) < Math.abs(min_gps_speed)) {
            min_gps_speed = gps_speed;
          }

          if (Math.abs(gps_speed) > Math.abs(max_gps_speed)) {
            max_gps_speed = gps_speed;
          }
        }
        // status_1 = data[16];
        if(data[16] !== "no_sign"){
          status_1 = data[16];
          status_2 = data[17];
        }
        status_3 = data[18];
      }

      res([
        ctr,
        sensor_time,
        utc_time,
        max_gyro_x,
        max_gyro_y,
        max_gyro_z,
        max_gyro_rot_x,
        max_gyro_rot_y,
        max_gyro_rot_z,
        min_ultrasonic,
        max_sound_sensor,
        max_alchohol,
        max_gyro_temp,
        latest_lat,
        latest_long,
        min_gps_speed,
        max_gps_speed,
        status_1,
        status_2,
        status_3,
      ]);
    } catch (err) {
      rej(err);
    }
  });
};

const createFolderForLogFiles = async (req, res, next) => {
  const vehicle_id = req.params.vehicle_id;
  const getDate = new Date();
  const getYear = getDate.getFullYear();
  const getMonth = getDate.getMonth() + 1;
  const getDay = getDate.getDate();

  const finalPath = `logfiles/${vehicle_id}/${getYear}/${getMonth}/${getDay}`;
  try {
    await fs.mkdir(finalPath, { recursive: true }, err => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal server error.', err);
      } else {
        console.log('Folder is created.');
      }
    });
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error: Server error' });
  }
};

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      setTimeout(() => {
        const vehicle_id = req.params.vehicle_id;
        const getDate = new Date();
        const getYear = getDate.getFullYear();
        const getMonth = getDate.getMonth() + 1;
        const getDay = getDate.getDate();
        const finalPath = `/logfiles/${vehicle_id}/${getYear}/${getMonth}/${getDay}`;
        cb(null, `./${finalPath}/`);
      }, 300);
    } catch (err) {
      return err.message;
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

let upload = multer({ storage: storage }).array('log_file', 2);

let fileUploadForLogFiles = util.promisify(upload);
module.exports = {
  fileUploadForLogFiles,
  getContentValue,
  createFolderForLogFiles,
};
