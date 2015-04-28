
/*

	Transcode a video stream into a file using FFMPEG.

	TODO: Fix video stream format / settings

*/

var	fs = require('fs'),
	ffmpeg = require('fluent-ffmpeg'),
	droneStream = require('../index.js');

// connect to the video stream
droneStream.connect();

// set-up streams
var output = fs.createWriteStream('output.mp4');

var input = new droneStream.DroneVideoTranscodeStream();
droneStream.tcpVideoStream.pipe(input);

// transcode (convert) the video stream
var obj = new ffmpeg(	{ source: input, nolog: true })
						.toFormat('mpeg')
						.writeToStream(output, function(retcode, error){
							if(error) {
								console.log(error);
							} else {
								console.log('file has been converted succesfully');
							}
						});