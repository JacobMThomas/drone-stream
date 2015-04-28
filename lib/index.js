var events = require('events'),
	arDrone = require('ar-drone'),
	stream = require('stream'),
	ffmpeg = require('fluent-ffmpeg');

drone_stream.prototype = new events.EventEmitter;
function drone_stream(client, options) {

	var parent 				= this;
	this.client 			= client || arDrone.createClient();

	this.tcpVideoStream 	= null;
	this.videoStream 		= null;

	// configuration
	this.debug 				= 100;
	this.reconnectOnTimeout	= true;

	this.connect = function() {

		console.log('Connecting to TCP Video Stream..');

		this.tcpVideoStream = new arDrone.Client.PngStream.TcpVideoStream();
		this.videoStream = new DroneVideoTranscodeStream();

	    this.tcpVideoStream.connect(function () {
	    	if(parent.debug > 0) {
	        	console.log('tcp stream connected.');
	        }
			parent.tcpVideoStream.pipe(parent.videoStream);
	    });

	    this.tcpVideoStream.on('error', function (err) {
	        console.log('There was an error: %s', err.message);

	        if(parent.tcpVideoStream) {
		        //parent.tcpVideoStream.end();
		        //parent.tcpVideoStream.emit("end");

		        if(parent.reconnectOnTimeout) {
			        parent.connect();
			    }
    		}
	    });

	    // make tcp stream act like old style (Node <0.10)
	    this.tcpVideoStream.on('data', function (data) {
	    	if(parent.debug > 0) {
	    		process.stdout.write('.');
	    	}
	    });

  	}

  	this.disconnect = function() {

  		parent.tcpVideoStream.end();
		parent.tcpVideoStream.emit('end');
		parent.tcpVideoStream = null;

  		parent.videoStream.end();
		parent.videoStream.emit('end');
		parent.videoStream = null;

		parent.emit('end');

  	}

    this.streamToFile = function(filepath) {
    	return new ffmpeg(	{ source: parent.videoStream, nolog: true })
							.withVideoCodec('copy')
							.saveToFile(filepath, function(stdout, stderr, err) {
								if(stderr || err) {
									console.log("error saving to file...")
								} else {
									console.log('done processing input stream');
								}
							});
    }

    this.transcodeStream = function(outputStream) {
    	return new ffmpeg(	{ source: parent.videoStream, nolog: true })
							.toFormat('mpeg')
							.writeToStream(outputStream, function(retcode, error){
								if(error) {
									console.log(error);
								} else {
									console.log('done processing input stream');
								}
							});
    }

}
module.exports = new drone_stream;

// intermediary stream to enable transcoding
function DroneVideoTranscodeStream(options) {
	if (!(this instanceof DroneVideoTranscodeStream))
		return new DroneVideoTranscodeStream(options);
	stream.Transform.call(this, options);
}

DroneVideoTranscodeStream.prototype = Object.create(
  stream.Transform.prototype, { constructor: { value: DroneVideoTranscodeStream }});

DroneVideoTranscodeStream.prototype._transform = function(chunk, encoding, done) {
	this.push(chunk);
	done();
};
module.exports.DroneVideoTranscodeStream = DroneVideoTranscodeStream;
