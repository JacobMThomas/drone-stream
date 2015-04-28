
/*

	Stream drone video stream over HTTP using HTML5 video tag

*/

var droneStream 	= require('../index.js'),
	http 			= require('http'),
	ffmpeg 			= require('fluent-ffmpeg'),
	fs				= require('fs');

// connect to the video stream
droneStream.connect();

// create an intermediary transform stream
// which we can use with other commands
var output = new droneStream.DroneVideoTranscodeStream();

// convert the drone's video feed on-the-fly
// using FFMPEG into OGG/Theora format
var transcoder = new ffmpeg(	{ source:  droneStream.videoStream, nolog: true })
								.toFormat('ogg')
								.writeToStream(	output,
												function(retcode, error){
													if(error) {
														console.log(error);
													}
												});

// create a file stream to save data locally
var file = fs.createWriteStream('out.ogg');

// pipe (stream) the data from the intermediary
// stream into a file on the local disk
output.pipe(file);

// server
var server = http.createServer(function (req, res) {

	if(req.url == '/camera.ogg') {
		res.writeHead(200, {	'Content-Type': 		'video/ogg',
								'Transfer-Encoding': 	'chunked' });

		output.on('data',function(data) {
			res.write(data);
		})

	} else {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end('<video src="http://localhost:8080/camera.ogg" controls autoplay />');
	}

}).listen(8080);
