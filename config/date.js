
const dateTime = () => {
    const { DateTime, Settings } = require("luxon");
    Settings.defaultZoneName = "Asia/Manila";

let date = DateTime.local().toISO();

return date;
}

const dateForGraphs = () => {
    const { DateTime, Settings } = require("luxon");
    Settings.defaultZoneName = "Asia/Manila";
let dateForGraphs = DateTime.local().toLocaleString(DateTime.DATETIME_SHORT);

return dateForGraphs
}

module.exports = {dateTime, dateForGraphs };