var target = view.center;
var speed = 4;
var torque = 10;
var maxLength = 40;
var head = view.center;
var velocity = new Point();
var noo = new Noodle();

view.pause();

noo.loadSVG('../assets/dude4.svg', function() {
  noo.position = view.center;
  noo.path = new Path();
  view.play();
})

function onFrame(event) {
  var delta = target - head;
  if (delta.length > speed) {
    velocity.length = speed;
    var a = delta.getDirectedAngle(velocity);
    if (a < 0 - torque) {
      velocity.angle += torque;
    }
    else if (a > 0 + torque) {
      velocity.angle -= torque;
    }
    else {
      velocity.angle = delta.angle;
    }

    head += velocity.rotate(Math.sin(event.count * 0.1) * 5);

    noo.path.insert(0, head);

    if (noo.path.segments.length > maxLength) {
      noo.path.removeSegments(maxLength + 1)
    }
  }
  else {
    target = Point.random() * (view.size * 0.25) + (view.size * 0.375);
  }
  noo.update();
}

function onMouseDown(event) {
  target = event.point;
}

function onMouseDrag(event) {
  target = event.point;
}