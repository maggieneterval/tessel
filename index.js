var tessel = require('tessel');
var http = require('http');
var server = http.createServer();
var accel = require('accel-mma84').use(tessel.port['A']);
var climatelib = require('climate-si7020');
var climate = climatelib.use(tessel.port['B']);
var port = 8080;
var open = require('open');
var os = require('os');

//acceleration variable:
var prevX = 0;
var prevY = 0;
var prevZ = 0;
var minDiff = 0.1;
var running = false;

//humidity variables:
var tooHot = 84; //degrees in farenheit that tests if too hot
var tooCold = 80; //degrees in farenheit that tests if too cold
var sweaty = 46; //humidity where you're too sweaty!

var responseString;

climate.on('ready', function () {
  accel.on('ready', function (){
    console.log('connected to accel and climate');
    setInterval(function (){
      accel.getAcceleration(function (err, xyz) {
        var x = xyz[0];
        var y = xyz[1];
        var z = xyz[2];

        console.log('x: ', x, 'y: ', y, 'z', z);

        var xDiff = Math.abs(x - prevX);
        var yDiff = Math.abs(y - prevY);
        var zDiff = Math.abs(z - prevZ);

        console.log(xDiff, yDiff, zDiff);

        if (xDiff > minDiff || yDiff > minDiff || zDiff > minDiff){
          running = true;
        } else {
          running = false;
        }

        console.log(running);

        prevX = x;
        prevY = y;
        prevZ = z;
      });

      climate.readTemperature('f', function (err, temp) {
        climate.readHumidity(function (err, humid) {
          console.log('Degrees:', temp.toFixed(2) + 'F', 'Humidity:', humid.toFixed(2) + '%RH');
          if (running === true){
            if (temp.toFixed(2) > tooHot) {
                responseString = 'https://www.youtube.com/embed/GeZZr_p6vB8?autoplay=1';
                // play It's Getting Hot in Here
              console.log("It's Getting Hot in Here!")
            } else if (humid.toFixed(2) > sweaty) {
                responseString = 'https://www.youtube.com/embed/l5aZJBLAu1E?autoplay=1';
                // play It's Raining Men
                console.log("It's Raining Men!")
            } else if (temp.toFixed(2) < tooCold) {
                responseString = 'https://www.youtube.com/embed/rog8ou-ZepE?autoplay=1';
                // play Ice, Ice Baby
                console.log("Ice, Ice Baby!")
            }
          } else if (running === false){
            responseString = 'https://www.youtube.com/embed/btPJPFnesV4?autoplay=1';
            console.log("Eye of the Tiger!");
          }
        });
      });
  }, 1000);
  });
});

//error handlers:
accel.on('error', function (err){
  console.log('Error:', err);
});
climate.on('error', function (err) {
  console.log('error connecting module', err);
});

//server setup:
http.createServer(function (req, res) {

  console.log('server is working');
    res.write('<iframe width="560" height="315" src=' + responseString +' frameborder="0" allowfullscreen></iframe>');
    res.end();

}).listen(port, () => console.log(`Listening on port 8080`, `http://${os.hostname()}.local:${port}`));



