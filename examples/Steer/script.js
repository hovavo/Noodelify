// TODO: move to steer class

var dudes = [];

for (var i = 0; i < 3; i++) {
  var dude = new Noodle();
  dude.loadSVG('../assets/dude4.svg', function(noodle) {
    register(noodle);
  });
}

function register(noodle) {
  noodle.path = new Path();
  noodle.position = getRandomTarget();
  noodle.target = view.center;
  noodle.speed = 4;
  noodle.torque = 10;
  noodle.maxLength = 40;
  noodle.head = getRandomTarget();
  noodle.velocity = new Point();
  dudes.push(noodle);
}


function onFrame(event) {
  dudes.forEach(function (noodle) {
    noodle.delta = noodle.target - noodle.head;
    if (noodle.delta.length > noodle.speed) {
      noodle.velocity.length = noodle.speed;
      var a = noodle.delta.getDirectedAngle(noodle.velocity);
      if (a < 0 - noodle.torque) {
        noodle.velocity.angle += noodle.torque;
      }
      else if (a > 0 + noodle.torque) {
        noodle.velocity.angle -= noodle.torque;
      }
      else {
        noodle.velocity.angle = noodle.delta.angle;
      }

      noodle.head += noodle.velocity.rotate(Math.sin(event.count * 0.1) * 5);

      noodle.path.add(noodle.head);

      if (noodle.path.segments.length > noodle.maxLength) {
        noodle.path.removeSegments(0, 1);
      }
    }
    else {
      noodle.target = getRandomTarget();
    }
    noodle.update();
  });
}

function onMouseDown(event) {
  dudes.forEach(function (noodle) {
    noodle.target = getRandomTarget();
  });
}

function getRandomTarget() {
  return Point.random() * (view.size * 0.4) + (view.size * 0.3);
}