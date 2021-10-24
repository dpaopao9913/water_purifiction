'use strict';
const Gpio = require('onoff').Gpio;
const turbidity = new Gpio(18, 'in');


function checkTurbiditySensorVal() {
    console.log(`turbidity val: ${turbidity.readSync()}`);
}

function stopMonitorTurbidity() {
    clearInterval(monitor_turbidity_val);
}

const interval_time = 1000
let monitor_turbidity_val = setInterval(
    (err, val) => {
        if (err) {
            stopMonitorTurbidity();
            throw err;
        }
        checkTurbiditySensorVal();
    }, interval_time
);
