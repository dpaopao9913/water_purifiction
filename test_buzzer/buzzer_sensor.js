'use strict';
const Gpio = require('onoff').Gpio;  // Gpio class
const buzzer = new Gpio(17, 'out');     // Export GPIO17 as an output
buzzer.writeSync(1);                    // Make GPIO-pin 17 high