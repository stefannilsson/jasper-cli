#!/usr/bin/env node
const argv = require('yargs')
  .usage('Usage: jasper-cli <command> [options]')
  .scriptName('jasper-cli')
  .describe('nocolor', 'Do not apply colors to output.')
  .describe('columns', 'Show only specific columns. Comma-separated list.')
  .describe('show-columns-available', 'Show columns available to show.')
  .demandCommand(1)
  .command('list', 'Display a column list of ICCIDs with details in plain text.')
  .recommendCommands(true)
  .argv;


const columnify = require('columnify');
const Colors = require('./lib/colors');
const colors = new Colors(argv.nocolor);
const Jasper = require('./lib/jasperapi.js');

const { JASPER_USERNAME, JASPER_APIKEY, JASPER_HOSTNAME } = process.env;
const jasper = new Jasper(JASPER_USERNAME, JASPER_APIKEY, JASPER_HOSTNAME);

// show-columns-available
if(argv.showColumnsAvailable) {
  jasper.availableDataColumns().map(col => console.log(` - ${col}`) );
  process.exit(0);
}


// list
if(!JASPER_USERNAME || !JASPER_APIKEY || !JASPER_HOSTNAME) {
  console.log(colors.constants.FgRed + "Oops! One or more of the required environment variables {JASPER_USERNAME,JASPER_APIKEY,JASPER_HOSTNAME} missing." + colors.constants.Reset);
  process.exit(-1);
}

(async () => {
  try {
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
  
    const fieldOfInterest = jasper.availableDataColumns();
    const explicitFieldsToShow = (argv.columns ? argv.columns.split(',') : fieldOfInterest);
  
    // only show fields of interest.
    Object.keys(devicesDetails).forEach(dev => {
      Object.keys(devicesDetails[dev]).forEach(key => {
        if(!explicitFieldsToShow.includes(key)) {
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
  
    console.error(colors.constants.FgCyan);
    console.error(headerText + colors.constants.Reset);
    console.log(detailsText);  
  }
  catch(e) {
    if(e.errno) {
      if(e.errno == 'ENOTFOUND') {
      console.error('Unable to get data from Jasper. Please check your Internet connection!');
      console.error(`(${e.toString()})`);
      process.exit(-2);
      }
      else if(e.errno == 'ACCESS_DENIED') {
        console.error('Unable to get data from Jasper. Please check your JASPER_USERNAME, JASPER_APIKEY and JASPER_HOSTNAME environment variables.')
        process.exit(-3);
      }
    }
    else {
      console.error(e.toString());
      process.exit(-999);
    }
  }  
})()
