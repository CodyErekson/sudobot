// Sudo-Bot main control script

// sudo xboxdrv -s --quiet -D --detach --wid 0 --dpad-as-button=true --pid-file=/var/run/xboxdrv --dbus disabled

var path = require("path");
var bunyan = require('bunyan');
var pbr = require('picoborgrev').picoborgrev();

// Set a deadzone of +/-3500 (out of +/-32k) and a sensitivty of 350 to reduce signal noise in joystick axis
var joystick = new (require('joystick'))(0, 3500, 350);

// init delay by waiting until have 6 on-axis events
var init = 0;

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

var axisMap = {};
axisMap['0'] = "ljoyx";
axisMap['1'] = "ljoyy";
axisMap['2'] = "rjoyx";
axisMap['3'] = "rjoyy";
axisMap['4'] = "rtrigger";
axisMap['5'] = "ltrigger";

var methodMap = {};
//button
methodMap.dup = null;
methodMap.ddown = null;
methodMap.dleft = null;
methodMap.dright = null;
methodMap.a = null;
methodMap.b = null;
methodMap.x = null;
methodMap.y = null;
methodMap.lb = "MotorsOff";
methodMap.rb = "MotorsOff";
methodMap.back = "GetEpo";
methodMap.start = "ResetEpo";
methodMap.xbox = "SetLed";
methodMap.lthumb = null;
methodMap.rthumb = null;
//axis
methodMap.ljoyx = null;
methodMap.ljoyy = "SetMotor1";
methodMap.rjoyx = null;
methodMap.rjoyy = "SetMotor2";
methodMap.rtrigger = null;
methodMap.ltrigger = null;

var log = new bunyan({
  name: "SudoBot",
  streams: [
    {
      path: path.resolve(__dirname) + "/log/info.log",
      level: 'info'
    },
    {
      path: path.resolve(__dirname) + "/log/error.log",
      level: 'error'
    },
    {
      path: path.resolve(__dirname) + "/log/debug.log",
      level: 'debug'
    },
    {
      path: path.resolve(__dirname) + "/log/trace.log",
      level: 'trace'
    },
    {
      path: path.resolve(__dirname) + "/log/warn.log",
      level: 'warn'
    },
    {
      path: path.resolve(__dirname) + "/log/fatal.log",
      level: 'fatal'
    }
  ],
  serializers: bunyan.stdSerializers
});

joystick.on('axis', function(data) {
   if ( init < 21 ){
        init++;
        if ( init === 21 ){
            console.log("Initialization complete!");
        }
        return;
    }
    var axis = axisMap[data.number];
    var method = methodMap[axis];
    if ( method ){
        switch( method ){
            case "SetMotor2":
                //calculate the motor power and direction -32767 to 32767 (total range of 65534, 655.34 per percentage point)
                var power2 = ( data.value * -1 ); // axis values are backwards
                var fwd2 = true;
                if ( power2 < 0 ){
                    fwd2 = false;
                    //let's just deal with positive values for now
                    power2 = ( power2 * -1 );
                }
                power2 = Math.ceil( ( power2 * 2 ) / 655.34 );
                if ( !fwd2 ){
                    power2 = ( power2 * -1 );
                }
                log.debug("Motor 2 power " + power2 + "%");
                pbr.SetMotor2(power2, function(err){
                    if ( err ){
                        log.error(err);
                    }
                });
                break;
            case "SetMotor1":
                //calculate the motor power and direction -32767 to 32767 (total range of 65534, 655.34 per percentage point)
                var power1 = ( data.value * -1 ); // axis values are backwards
                var fwd1 = true;
                if ( power1 < 0 ){
                    fwd1 = false;
                    //let's just deal with positive values for now
                    power1 = ( power1 * -1 );
                }   
                power1 = Math.ceil( ( power1 * 2 ) / 655.34 );
                if ( !fwd1 ){
                    power1 = ( power1 * -1 );
                }   
                log.debug("Motor 1 power " + power1 + "%");
                pbr.SetMotor1(power1, function(err){
                    if ( err ){
                        log.error(err);
                    }
                });
                break;
        }
    }
});

joystick.on('button', function(data) {
    if ( init < 21 ){
        init++;
        if ( init === 21 ){
            console.log("Initialization complete!");
        }
        return;
    }
    var button = buttonMap[data.number];
    var method = methodMap[button];
    if ( method ){
        switch( method ){
            case "MotorsOff":
                pbr.MotorsOff(function(err){
                    if ( err ){
                        log.error(err);
                    }
                });
                break;
            case "GetEpo":
                pbr.GetEpo(function(err, res){
                    if ( err ){
                        log.error(err);
                    }
                    console.log(res);
                });
                break;
            case "ResetEpo":
                pbr.ResetEpo(function(err){
                    if ( err ){
                        log.error(err);
                    }
                });
                break;
            case "SetLed":
                if ( data.value === 0 ){
                    return;
                }
                pbr.GetLed(function(err, state){
                    if ( err ){
                        log.error(err);
                    }
                    state = !state; //toggle
                    pbr.SetLed(state, function(err){
                        if ( err ){
                            log.error(err);
                        }
                    });
                });
                break;
        }
    }
});
