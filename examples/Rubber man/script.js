view.pause();

var noo = new Noodle();
var middleSegment;

// TODO: Move to class
var animation = {
  duration: 50,
  progress: 0,
  origin: null,
  destination: null,
  running: function () {
    return animation.progress < animation.duration;
  },
  step: function () {
    if (animation.running()) {
      var diff = animation.origin - animation.destination;
      var out = animation.destination + diff * (1 - elastic(animation.progress / animation.duration));
      animation.progress++;
      return out;
    }
  }
}

noo.loadSVG('../assets/dude3.svg', function () {
  // noo.stretchStart = 70;
  // noo.stretchEnd = 30;
  noo.position = view.center;
  middleSegment = noo.path.divideAt(noo.path.length / 2);
  animation.destination = middleSegment.point.clone();
});


noo.onMouseDown = function (event) {
  middleSegment.point = noo.path.getNearestPoint(event.point);
}

function onMouseDrag(event) {
  if (middleSegment) {
    middleSegment.point += event.delta;
    noo.path.smooth();
    noo.update();
  }
}

function onMouseUp(event) {
  animation.origin = middleSegment.point.clone();
  animation.progress = 1;
  view.play();
}

function onFrame() {
  if (!animation.origin) return;

  if (animation.running()) {
    middleSegment.point = animation.step();
  }
  else {
    middleSegment.point = animation.destination;
    view.pause();
  }
  noo.path.smooth();
  noo.update();
}


function elastic(t) {
  return (.04 - .04 / t) * Math.sin(25 * t) + 1
}