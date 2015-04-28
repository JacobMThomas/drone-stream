
/*

	Stream video into a file.

*/

var	fs = require('fs'),
	droneStream = require('../index.js');

// connect to the video stream
droneStream.connect();

// transcode (convert) stream
// and stream it into a file
var output = fs.createWriteStream('output.mpg');
droneStream.transcodeStream(output);
