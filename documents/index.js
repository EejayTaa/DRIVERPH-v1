module.exports = (
  plateNum,
  assignedDriver,
  company,
  dateAssigned,
  sensorDate,
  gyroAccX,
  gyroAccY,
  gyroAccZ,
  gyroRotX,
  gyroRotY,
  gyroRotZ,
  soundSensor,
  ultrasonicSensor,
  alcoholSensor,
  gyroTemp,
  latitude,
  longitude,
  gpsSpeed,
  status1,
  status2,
  status3,
  status4,
  imageUrl,
  logo,
  alcoholLegend,
  ultrasonicLegend,
  soundLegend
) => {
  const today = new Date();
  return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                margin: 3em 4em;
            }
            
            ul {
                list-style: none;
                margin: 0;
                padding: 0;
            }
            
            hr {
                border: 3px solid #dddd;
                background: #dddd;
            }
            
            .header-container {
                display: flex;
                flex-direction: column;
                margin-bottom: 2em;
            }
            
            .header-container img {
                width: 15rem;
                margin-left: -.6em;
            }
            
            .header-container p {
                margin-top: -.5em;
                font-weight: 700;
                color: rgba(149, 147, 147, 0.867);
            }
            
            .heading h2 {
                text-align: center;
                font-size: 32px;
                margin: 0;
            }
            
            .general-info h3 {
                color: #1C8DF1;
            }
            
            .item-title {
                font-weight: 500;
            }
            
            .item-content {
                font-style: italic;
            }
            
            .general-info-table,
            .sensory-data-table,
            .remarks-table,
            .sensory-data-impressions-table {
                border-collapse: collapse;
                margin: 25px 0;
                font-size: 0.9em;
                width: 100%;
            }
            .date{
                font-size: 0.9em;
            }
            .general-info-table tr td:nth-child(2) {
                text-align: end;
            }
            
            .sensory-data h3 {
                color: #1C8DF1;
            }
            
            .sensory-data-table thead tr {
                background-color: #1C8DF1;
                color: #fff;
                text-align: left;
            }
            
            .sensory-data-impressions-table thead tr,
            .remarks-table thead tr {
                background-color: #c4c4c4;
                color: #fff;
                text-align: left;
            }
            
            .sensory-data-impressions-table,
            .sensory-data-impressions-table th,
            .sensory-data-impressions-table td,
            .remarks-table,
            .remarks-table th,
            .remarks-table td {
                border: 1px solid black;
            }
            
            .sensory-data-table th,
            .sensory-data-table td,
            .remarks-table td,
            .remarks-table th,
            .sensory-data-impressions-table td,
            .sensory-data-impressions-table th {
                padding: 0.7em 1em;
            }
            
            .sensory-data-table tbody tr {
                border-bottom: 1px solid #dddddd;
            }
            
            .sensory-data-table tbody tr:nth-child(even) {
                background-color: #f3f3f3;
            }
            
            .remarks-container {
                width: 100%;
            }
            
            .remarks-box {
                width: 100%;
            }
            
            .ml-img {
                width: 100%;
                margin: 25px 0;
            }
            
            .date span {
                font-weight: 500;
            }
        </style>
    </head>
    
    <body>
        <div class="header">
            <div class="header-container">
                <img src="${logo}" alt="logo">
                <p>Drivers Roadworthiness Improvement Verification Education and Readiness for the Philippine Logistics Industry</p>
            </div>
        </div>
        <div class="heading">
            <hr>
            <h2>GENERATED REPORT</h2>
            <hr>
        </div>
        <div class="general-info">
            <h3>GENERAL INFORMATION</h3>
            <div class="general-info-container">
                <table class="general-info-table">
                    <tbody>
                        <tr>
                            <td>
                                <bold>Driver's Name</bold>&nbsp; &nbsp; &nbsp; ${assignedDriver} </td>
                            <td>Date Assigned &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${dateAssigned}</td>
                        </tr>
                        <tr>
                            <td>Plate Number&nbsp; &nbsp; &nbsp; ${plateNum} </td>
                            <td>Company&nbsp; &nbsp; &nbsp; ${company}</td>
                        </tr>
    
                    </tbody>
                </table>
            </div>
        </div>
        <hr>
    
        <div class="sensory-data">
            <h3>SENSORY DATA INFORMATION</h3>
            <p class="date">Date Issued: ${sensorDate}  </p>
            <div class="sensory-data-container">
    
                <table class="sensory-data-table">
                    <thead>
    
    
                        <tr>
                            <th>Sensor Type</th>
                            <th>Units</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Sound Sensor</td>
                            <td>bit</td>
                            <td>${soundSensor}</td>
                        </tr>
                        <tr>
                            <td>Alcohol Sensor</td>
                            <td>ppm</td>
                            <td>${alcoholSensor}</td>
                        </tr>
                        <tr>
                            <td>Ultrasonic Sensor</td>
                            <td>cm</td>
                            <td>${ultrasonicSensor}</td>
                        </tr>
                        <tr>
                            <td>Truck Speed </td>
                            <td>km/p</td>
                            <td>${gpsSpeed}</td>
                        </tr>
                        <tr>
                            <td>GPS Sensor Latitude</td>
                            <td></td>
                            <td>${latitude}</td>
                        </tr>
                        <tr>
                            <td>GPS Sensor Longitude</td>
                            <td></td>
                            <td>${longitude}</td>
                        </tr>
                        <tr>
                            <td>Gyroscope Sensor Temperature</td>
                            <td>deg-C</td>
                            <td>${gyroTemp}</td>
                        </tr>
                        <tr>
                            <td>Accelerometer Sensor Acceleration X</td>
                            <td>m/s2</td>
                            <td>${gyroAccX}</td>
                        </tr>
                        <tr>
                            <td>Accelerometer Sensor Acceleration Y</td>
                            <td>m/s2</td>
                            <td>${gyroAccY}</td>
                        </tr>
                        <tr>
                            <td>Accelerometer Sensor Acceleration Z</td>
                            <td>m/s2</td>
                            <td>${gyroAccZ}</td>
                        </tr>
                        <tr>
                            <td>Gyroscope Sensor Rotation X</td>
                            <td>r/s</td>
                            <td>${gyroRotX}</td>
                        </tr>
                        <tr>
                            <td>Gyroscope Sensor Rotation Y</td>
                            <td>r/s</td>
                            <td>${gyroRotY}</td>
                        </tr>
                        <tr>
                            <td>Gyroscope Sensor Rotation Z</td>
                            <td>r/s</td>
                            <td>${gyroRotZ}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <br>
        <br>
        <br>
        <br>
        <p>Below are the following impression from the generated sensory data:</p>
        <div class="sensory-data-impressions">
    
            <div class="sensory-data-impressions-container">
                <table class="sensory-data-impressions-table">
                    <thead>
                        <th>Sensor</th>
                        <th>Value</th>
                        <th>Legends</th>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Alcohol Sensor</td>
                            <td>${alcoholSensor} ppm</td>
                            <td>${alcoholLegend}</td>
                        </tr>
                        <tr>
                            <td>Ultrasonic Sensor</td>
                            <td>${ultrasonicSensor} cm</td>
                            <td>${ultrasonicLegend}</td>
                        </tr>
                        <tr>
                        <td>Sound Sensor</td>
                        <td>${soundSensor} bit</td>
                        <td>${soundLegend}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <hr>
        <div class="remarks">
            <div class="remarks-container">
                <div class="remarks-box">
                    <img class="ml-img" src="${imageUrl}">
                </div>
                <div class="remarks-box">
                <p>Below are the following impression from the generated machine learning image:</p>
                    <table class="remarks-table">
                        <thead>
                            <tr>
                                <th>Sign</th>
                                <th>Remark</th>
                                <th>Validation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${status1}</td>
                                <td>${status2}</td>
                                <td>${status4}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
    
            </div>
        </div>
        <hr>
     
        <p class="date"><span>Date:</span> ${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()} ${today.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
        })}</p>
    </body>
    
    </html>`;
};
