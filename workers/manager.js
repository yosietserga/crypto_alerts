const doorman = require('./doorman');
const common = require("../utils/helpers");

const { log, isset } = common;

global.myData = {};

myData.get = k => {
    if (!isset(k) || k == 'get' || k == 'set') return;
    return isset(myData[k]) ? myData[k] : null;
}

myData.set = (k, v) => {
    if (!isset(k) || k == 'get' || k == 'set') return;
    myData[k] = v;
}


myData.set('testing', [1,2,3,4]);


function callWorker(...args) {
    let worker = args[0];
    let criterias = args.length > 1 ? args[1] : [];

    try {
        let ok = worker.isOK();
        if (ok) {
            worker.addCriteria( criterias );
            worker.start();
        }
    } catch(error) {
        log(error, 'error');
    }
}

const start = ex => {
    if (myData.get('debug')) log('Starting Management');
    if (myData.get('debug')) log('Getting Exchange pairs list');
	ex.exchangeInfo((error, data) => {
        if (error) console.error(error);
        if (myData.get("debug")) log(data);

        if (myData.get("debug")) log("Initiating Doorman");
        let __doorman = doorman.init(ex);

        if (myData.get("debug")) log("Calling the Doorman");
        if (myData.get("doorman:criterias")) {
            callWorker(__doorman, myData.get("doorman:criterias"));
        } else {
            callWorker(__doorman);
        }
    });
}

module.exports = {
    start
};
