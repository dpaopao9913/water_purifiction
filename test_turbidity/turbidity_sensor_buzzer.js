'use strict';
const Gpio = require('onoff').Gpio;

const buzzer            = new Gpio(17, 'out');
const turbidity         = new Gpio(18, 'in');
const counter_threshold = 5;
let   counter           = 0;


function checkTurbiditySensorVal() {
    let turbidity_val = turbidity.readSync();
    console.log(`turbidity val (digital): ${turbidity_val}`);
    if (turbidity_val == 1) {       // pure water
        counter += 1;
        if (counter >= counter_threshold) {
            buzzer.writeSync(1);    // buzzer on
        }
    } else if (turbidity_val == 0){ // dirty water
        counter = 0;
        buzzer.writeSync(0);        // buzzer off
    }
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
