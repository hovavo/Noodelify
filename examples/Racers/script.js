var bg = new Shape.Rectangle([0,0], view.size);
bg.fillColor = 'white';

var frameCount = 0;
var gap = 400;
var totalFrames = 60 * 10;

var tracks = [];
tracks.push(new Path(`M228.7,187.1c-15.3,0-27.7,12.4-27.7,27.7v1.6c0,15.3,12.4,27.7,27.7,27.7h142.6
	c15.3,0,27.7,12.4,27.7,27.7v0c0,15.3-12.4,27.7-27.7,27.7H228.7c-15.3,0-27.7,12.4-27.7,27.7v1.6c0,15.3,12.4,27.7,27.7,27.7h142.6
	c15.3,0,27.7,12.4,27.7,27.7v0.8c0,15.3-12.4,27.7-27.7,27.7H228.7c-15.3,0-27.7-12.4-27.7-27.7v-0.8c0-15.3,12.4-27.7,27.7-27.7
	h142.6c15.3,0,27.7-12.4,27.7-27.7v-1.6c0-15.3-12.4-27.7-27.7-27.7H228.7c-15.3,0-27.7-12.4-27.7-27.7v0
	c0-15.3,12.4-27.7,27.7-27.7h142.6c15.3,0,27.7-12.4,27.7-27.7v-1.6c0-15.3-12.4-27.7-27.7-27.7H228.7z`));

tracks.forEach(function (track) {
  track.position = view.center;
  track.population = 1;
  track.speed = track.length / totalFrames;
  track.racers = [];

  for (var i = 0; i < track.population; i++) {
    var racer = new Noodle();
    racer.loadSVG('../assets/racer2.svg', function (noodle) {
      track.racers.push(racer);
    });
  }
})


function onFrame(event) {

  tracks.forEach(function (track) {
    track.racers.forEach(function (racer, i) {
      racer.path = getSubPath(track, (frameCount * track.speed) + gap * i, racer.path.length);
      racer.update();
    });
  });

  if (window.stopHook && frameCount >= gap)
    window.stopHook()

  if (window.renderHook)
    window.renderHook(frameCount);

  frameCount ++;
}


function getSubPath(path, start, length) {
  start = start % path.length;
  var subPath = path.clone();
  subPath.splitAt(start).remove();
  subPath.splitAt(length).remove();
  return subPath;
}

if (window.startHook)
  window.startHook();
