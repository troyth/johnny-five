var EventEmitter = require('events').EventEmitter,
    exec = require("child_process").exec,
    util = require("util");


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
  this.filepath = opts.filepath || __dirname + '/public/images/';
  this.filename = opts.filename || new Date().getTime();

  this.length = opts.length || 5000;//length in ms of video or timelapse, 0 is infinite

  EventEmitter.call(this);

  switch(this.mode){
    case 'still':
      //timelapse or not
      if(this.freq > 0){
        var count = 0;
        INTERVAL_ID = setInterval(function(){
          count++;

          var proc_cmd = '/opt/vc/bin/raspistill'+
            ' -w ' + this.width +
            ' -h ' + this.height +
            ' -t '+ this.delay +
            ' -q ' + this.quality +
            ' -n' +
            ' -o ' + this.filepath + this.filename + '-tl-' + count + '.' + this.encoding;

          var self = this;

          console.log('*** about to run cmd: ');
          console.log(proc_cmd);

          exec(proc_cmd, function (err, stdout, stderr) {
            console.log('++++ cmd returned');
            self.emit( "read", err, self.filename + '-tl-' + count + '.' + self.encoding );
          });
        }.bind(this), this.freq);
      }else{
        var proc_cmd = '/opt/vc/bin/raspistill'+
          ' -w ' + this.width +
          ' -h ' + this.height +
          ' -t '+ this.delay +
          ' -q ' + this.quality +
          ' -n' +
          ' -o ' + this.filepath + this.filename + '.' + this.encoding;

        var self = this;

        exec(proc_cmd, function (err, stdout, stderr) {
          self.emit( "read", err, self.filename + '.' + this.encoding );
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
