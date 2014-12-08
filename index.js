// Sudo-Bot main control script

// sudo xboxdrv -s --quiet -D --detach --wid 0 --dpad-as-button=true --pid-file=/var/run/xboxdrv --dbus disabled

var prb = require('picoborgrev').picoborgrev();

// Set a deadzone of +/-3500 (out of +/-32k) and a sensitivty of 350 to reduce signal noise in joystick axis
var joystick = new (require('joystick'))(0, 3500, 350);

var sbutton = null; //store last button pressed

//Config options

var verbose = false; //set true to console everything

var buttonMap = {};
buttonMap['0'] = "dup";
buttonMap['1'] = "ddown";
buttonMap['2'] = "dleft";
buttonMap['3'] = "dright";
buttonMap['4'] = "a";
buttonMap['5'] = "b";
buttonMap['6'] = "x";
buttonMap['7'] = "y";
buttonMap['8'] = "lb";
buttonMap['9'] = "rb";
buttonMap['10'] = "back";
buttonMap['11'] = "start";
buttonMap['12'] = "xbox";
buttonMap['13'] = "lthumb";
buttonMap['14'] = "rthumb";

//joystick.on('button', console.log);
//joystick.on('axis', console.log);

joystick.on('button', function(data) {
    console.log("type: " + data.type + ", number: " + data.number + ", value: " + data.value);
    console.log("button " + buttonMap[data.number] + " was pressed");
});
