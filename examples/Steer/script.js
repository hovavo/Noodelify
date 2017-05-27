// TODO: move to steer class

var amount = 3;
var dudes = [];

for (var i = 0; i < amount; i++) {
  var dude = new Noodle();
  dude.loadSVG('../assets/dude4.svg', function(noodle) {
    noodle.position = getRandomTarget();
    noodle.path = new Path();
    noodle.target = view.center;
    noodle.speed = 4;
    noodle.torque = 10;
    noodle.maxLength = 40;
    noodle.head = getRandomTarget();
    noodle.velocity = new Point();
    dudes.push(noodle);
  });
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

      noodle.path.insert(0, noodle.head);

      if (noodle.path.segments.length > noodle.maxLength) {
        noodle.path.removeSegments(noodle.maxLength + 1)
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