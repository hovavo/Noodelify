var noo;

project.importSVG('../assets/dude4.svg', {
  expandShapes: true, onLoad: function (group) {
    noo = new Noodle(group, new Path());
    noo.position = view.center;
    // noo.path.selected = true;
  }
});


var target = view.center;
var speed = 4;
var torque = 4;
var maxLength = 40;

var head = view.center;
var velocity = new Point();

function onFrame(event) {
  if (!noo) return;
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
    target = Point.random() * view.size;
  }
  noo.update();

}

function onMouseDown(event) {
  target = event.point;
}

function onMouseDrag(event) {
  target = event.point;
}