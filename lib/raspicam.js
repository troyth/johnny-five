var EventEmitter = require('events').EventEmitter
    , exec = require("child_process").exec
    , util = require("util")
    , fs = require("fs");



var INFINITY_MS = 999999999;//maximum timeout allowed by raspicam command

//array of child processes
var _children  = [];

//set up exit strategy to kill all child processes (eg. for timelapse) on process exit
process.on('exit', function() {
  console.log('raspicam.js::killing', _children.length, 'child processes');
  _children.forEach(function(child) {
    child.kill();
  });
});

/**
 * RaspiCam
 * @constructor
 *
 * @description Generic analog or digital sensor constructor
 *
 * @param {Object} opts Options: pin, freq, range
 */
function RaspiCam( opts ) {

  if ( !(this instanceof RaspiCam) ) {
    return new RaspiCam( opts );
  }

  var INTERVAL_ID;

  // Sensor instance properties
  this.mode = opts.mode || 'still';//still or video
  this.freq = opts.freq || 0;//if 0, just a single still
  this.delay = opts.delay || 0;//time to wait til taking the picture
  this.width = opts.width || 640;
  this.height = opts.height || 480;
  this.quality = opts.quality || 80;//from 0-100
  this.encoding = opts.encoding || 'jpg';//jpg, gif, bmp, png
  this.filepath = opts.filepath || __dirname + '/images/';
  this.filename = opts.filename || new Date().getTime() + '_' + this.freq + '_%d' + '.' + this.encoding;
  this.timeout = opts.timeout || INFINITY_MS;
  if(this.timeout > INFINITY_MS) this.timeout = INFINITY_MS;

  this.length = opts.length || 5000;//length in ms of video or timelapse, 0 is infinite

  EventEmitter.call(this);

  switch(this.mode){
    case 'still':

      //TIMELAPSE
      if(this.freq > 0){

        var proc_cmd = '/opt/vc/bin/raspistill'+
          ' -w ' + this.width +
          ' -h ' + this.height +
          ' -t '+ this.timeout +
          ' -q ' + this.quality +
          ' -n' + //no preview: does not display a preview window
          ' -tl ' + this.freq + //sets timelapse
          ' -o ' + this.filepath + this.filename;

        var self = this;

        console.log('RASPICAM.JS: STARTING TIMELAPSE CMD WITH CMD: '+ proc_cmd);

        console.log('WATCHING FILEPATH: '+ this.filepath);

        fs.watch(this.filepath, function(event, filename){
          if(event == 'rename'){
            self.emit( "read", null, filename );
          }//rename is called once, change is called 3 times, so check for rename to elimate duplicates
        });
        
        var child = exec(proc_cmd, function (err, stdout, stderr) {
          console.log('raspicam.js::timelapse photos started');
          //self.emit( "read", err, self.filename + '-tl-' + count + '.' + self.encoding );
        });

        _children.push( child );

      //STILL
      }else{
        console.log('johnny-five raspicam taking a still');
        var proc_cmd = '/opt/vc/bin/raspistill'+
          ' -w ' + this.width +
          ' -h ' + this.height +
          ' -t '+ this.delay +
          ' -q ' + this.quality +
          ' -n' + //no preview: does not display a preview window
          ' -o ' + this.filepath + this.filename + '.' + this.encoding;

        var self = this;

        exec(proc_cmd, function (err, stdout, stderr) {
          //callback
          self.emit( "read", err, self.filename + '.' + self.encoding );
        });
      }

      break;
    case 'video':

      break;
  }

        
}

RaspiCam.prototype.__proto__ = EventEmitter.prototype;

/**
 * pinMode Change the sensor's pinMode on the fly
 * @param  {Number} mode Sensor pin mode value
 * @return {Object} instance
 */
RaspiCam.prototype.start = function( ) {
  
  
};



module.exports = RaspiCam;
