const Jasper = require('./lib/jasperapi.js');
const columnify = require('columnify');
const colors = require('./lib/colors');

const { JASPER_USERNAME, JASPER_APIKEY, JASPER_HOSTNAME } = process.env;
const jasper = new Jasper(JASPER_USERNAME, JASPER_APIKEY, JASPER_HOSTNAME);

if(!JASPER_USERNAME || !JASPER_APIKEY || !JASPER_HOSTNAME) {
  console.log(colors.constants.FgRed + "Oops! One or more of the required environment variables {JASPER_USERNAME,JASPER_APIKEY,JASPER_HOSTNAME} missing.")
  process.exit(-1);
}

(async () => {
  const { devices } = await jasper.devices();
  const devicesDetails = {};

  if(devices) {
    devices.forEach(basicInfo => {
      const { iccid, status, ratePlan, communicationPlan } = basicInfo;
      devicesDetails[iccid] = {
        iccid,
        status,
        ratePlan,
        communicationPlan,
      }
    });
  }
  
  const allIccids = Object.keys(devicesDetails);
  const detailsPromises = allIccids.map(id => jasper.deviceInfo(id));
  const allDetails = await Promise.all(detailsPromises);

  allDetails.forEach(details => {
    devicesDetails[details.iccid] = {
      ...devicesDetails[details.iccid],
      ...details
    };
  });

  const fieldOfInterest = [
    'iccid',
    'status',
    'ratePlan',
    'communicationPlan',
    'imsi',
    'imei',
    'customer',
    'accountCustom1',
    'deviceID',
    'modemID',

    // sessionInfo
    'ipAddress',
    'dateSessionStarted',
    'dateSessionEnded',

    // ctdDataUsage
    'ctdDataUsage',
    'overageLimitReached',
  ];

  // remove fields of no interest.
  // TODO: Make configurable/args aware.
  Object.keys(devicesDetails).forEach(dev => {
    Object.keys(devicesDetails[dev]).forEach(key => {
      if(!fieldOfInterest.includes(key)) {
        delete devicesDetails[dev][key];
      }
    })
  });

  const columnifyArray = [];
  Object.keys(devicesDetails).forEach(e => { columnifyArray.push(devicesDetails[e]) });

  const outputText = columnify(columnifyArray);
  var o = outputText.split("\n");
  const headerText = o.shift();

  o = o.map(m => { return colors.colorize(m) } );
  const detailsText = o.join("\n");

  console.log(colors.constants.FgCyan);
  console.log(headerText + colors.constants.Reset);
  console.log(detailsText);  
})()

