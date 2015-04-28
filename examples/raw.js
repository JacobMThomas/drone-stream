/*

	Stream the raw video stream into a file.

	the raw stream is not capable of playback,
	in order to do that you must enclose it in 
	a compatible encolsure format, such as mp4.

	Use FFMPEG to create a playable file:
	
	ffmpeg -i output.h264 -vcodec copy out.mp4

*/

var droneStream = require('../index.js');
	fs = require('fs');

// connect to the video stream
droneStream.connect();

// stream video data directly to disk
var file = fs.createWriteStream('output.h264');
droneStream.tcpVideoStream.pipe(file);