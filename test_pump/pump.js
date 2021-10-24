'use strict';

const Gpio = require('onoff').Gpio;  // Gpio class
var sleep = require('sleep');
let buzzer;

let counter = 0;
let val;
while (true) {
    counter += 1;
    if (counter % 2 == 0) {
        buzzer = new Gpio(18, 'out');     // Export GPIO17 as an output
        buzzer.writeSync(1);                    // Make GPIO-pin 17 high
        sleep.sleep(3);
        buzzer.writeSync(0);                    // Make GPIO-pin 17 high
        sleep.sleep(3);
    }else {
        buzzer = new Gpio(18, 'in');     // Export GPIO17 as an output
        val = buzzer.readSync(1);                    // Make GPIO-pin 17 high
        console.log(`val= ${val}`);
        sleep.sleep(3);
    }  
}
