var hint;
var noo = new Noodle();

noo.loadSVG('../assets/dude3.svg', function() {
  noo.position = view.center;
  // noo.stretchStart = 70;
  // noo.stretchEnd = 30;
})

function onMouseDown(event) {
  if (!hint) {
    noo.path = new Path();
    hint = new Path();
    hint.strokeColor = 'blue';
  }
  noo.path.add(event.point);
  noo.update();
}

function onMouseDrag(event) {
  var vector = event.point - noo.path.lastSegment.point;
  noo.path.lastSegment.handleOut = vector;
  noo.path.lastSegment.handleIn = vector.rotate(180);

  hint.segments = [
    noo.path.lastSegment.point + vector,
    noo.path.lastSegment.point + vector.rotate(180)
  ];

  noo.update();
}

function onMouseMove(event) {
  if (hint) {
    hint.segments = [
      noo.path.lastSegment,
      event.point
    ];
  }
}

function onKeyUp(event) {
  if (event.key == 's') {
    noo.selected = !noo.selected;
  }
}