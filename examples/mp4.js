
/*

	Stream an mp4 video stream into a file.

*/

var droneStream = require('../index.js');

// connect to the video stream
droneStream.connect();

// stream playback-capable file
droneStream.streamToFile('output.mp4');
