var bg = new Shape.Rectangle([0,0], view.size);
bg.fillColor = 'white';

var population = 9;
var speed = 2;
var frameCount = 0;


var p = new Path(`M647.4,306.5L647.4,306.5c-11.1,0-21,7.3-24.2,17.9c-12.7,41.3-43,75.1-82.2,92.7
	c-16.6,7.5-35.5-4.5-35.5-22.8v0c0-9.9,5.9-18.8,15-22.9c34.2-15.5,58.1-49.7,59-89.1c0.9-41.7-23.5-78-59.3-93.8
	c-9-4-14.7-12.9-14.7-22.9h0c0-18,18.3-29.9,34.8-22.8c40.1,17.4,70.6,51.6,83.3,93.9c3.2,10.6,12.9,17.9,24,17.9h0
	c16.7,0,28.8-16.1,24-32.2C642.7,126.7,545.2,62.3,436.8,84.7c-75.6,15.7-135.3,74.8-151.8,150.2c-11.1,50.6-3,99,18.5,139.2
	c7.9,14.8,27.8,17.9,39.6,6l0,0c7.8-7.8,9.5-19.8,4.3-29.5c-11.4-21.2-17.9-45.5-17.8-71.2c0.2-60.9,37-113.1,89.1-136.4
	c16.4-7.3,34.9,4.5,34.9,22.5v0.6c0,9.8-5.8,18.5-14.7,22.5c-12.8,5.8-24.2,14.2-33.5,24.7c-14.2,15.9-2.6,41.1,18.7,41.1h0.9
	c7.1,0,13.8-3.1,18.6-8.4c8.2-9,19.5-14.6,32.2-15.7c28.5-2.4,53.6,19.8,54.4,48.4c0.7,28.2-21.9,51.5-50,51.5
	c-14.4,0-27.4-6.3-36.6-15.9c-4.8-5-11.3-7.9-18.2-7.9h0c-21.9,0-33.5,26.3-18.4,42.2c9,9.5,19.9,17.3,32,22.8
	c8.9,4,14.8,12.8,14.8,22.6v0.6c0,18-18.6,29.8-35,22.4c-3.1-1.4-6.1-2.9-9.1-4.5c-9.7-5.2-21.7-3.5-29.6,4.3l0,0
	c-11.9,11.9-8.9,31.8,5.9,39.8c28.1,15.1,60.2,23.6,94.2,23.6c90.2,0,166.5-59.8,191.4-141.7C676.3,322.6,664.1,306.5,647.4,306.5z`);

p.position = view.center;


var gap = p.length / population;
var dudes = [];

for (var i = 0; i < population; i++) {
  var dude = new Noodle();
  dude.loadSVG('../assets/worm.svg', function (noodle) {
    register(noodle);
  });
}

function register(noodle) {
  dudes.push(noodle);
}


function onFrame(event) {
  if (!dudes.length) return;

  dudes.forEach(function (noo, i) {
    noo.path = getSubPath(p, (frameCount * speed) + gap * i, noo.path.length);
    noo.update();
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
