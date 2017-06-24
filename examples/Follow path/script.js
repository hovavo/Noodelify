var p = new Path(`M637.8,164.9v172.6c0,12.7-10.3,23-23,23l0,0c-12.7,0-23-10.3-23-23v-78c0-12.7-10.3-23-23-23
	l0,0c-12.7,0-23,10.3-23,23v78c0,12.7-10.3,23-23,23l0,0c-12.7,0-23-10.3-23-23v-78c0-12.7-10.3-23-23-23h0c-12.7,0-23,10.3-23,23
	v79c0,12.2-9.8,22-22,22h0c-12.2,0-22-9.8-22-22v-79.5c0-12.4-10.1-22.5-22.5-22.5h0c-12.4,0-22.5,10.1-22.5,22.5v95.2
	c0,29.4,23.9,53.3,53.3,53.3h199.7c13.3,0,24,10.7,24,24v0c0,13.3-10.7,24-24,24H412.4c-52,0-94.2-42.2-94.2-94.2V257.5
	c0-36.1,29.3-65.4,65.4-65.4h186.2c12.1,0,22-9.8,22-22v0c0-12.1-9.8-22-22-22H340c-12,0-21.7-9.7-21.7-21.7v0
	c0-12,9.7-21.7,21.7-21.7h237.4C610.7,104.6,637.8,131.6,637.8,164.9z`);

p.position = view.center;


var dudes = [];

for (var i = 0; i < 7; i++) {
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
    noo.path = getSubPath(p, (event.count * 4) + 400 * i, noo.path.length);
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