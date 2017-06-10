var p = new Path(`M-378.7,369.5V189.1c0-32.1,26-58.1,58.1-58.1h14.2c32.1,0,58.1,26,58.1,58.1v0c0,32.1-13.1,58.1-45.2,58.1
	h-16.8c-10,0-18.1,8.1-18.1,18.1v0c0,10,8.1,18.1,18.1,18.1h10c35.1,0,63.6,28.5,63.6,63.6v22.5c0,32.3-26.2,58.5-58.5,58.5h-25
	C-352.5,428-378.7,401.8-378.7,369.5z`);
p.position = view.center;


var dudes = [];

for (var i = 0; i < 4; i++) {
  var dude = new Noodle();
  dude.loadSVG('../assets/dude4.svg', function (noodle) {
    register(noodle);
  });
}

function register(noodle) {
  dudes.push(noodle);
}


function onFrame(event) {
  dudes.forEach(function (noo, i) {
    noo.path = getSubPath(p, (event.count * 1.5) + 220 * i, noo.path.length);
    noo.update();
  });
}


function getSubPath(path, start, length) {
  start = start % path.length;
  var subPath = path.clone();
  subPath.splitAt(start).remove();
  subPath.splitAt(length).remove();
  return subPath;
}