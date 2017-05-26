class NoodlePoint {
  constructor(offset, distance) {
    this.offset = offset;
    this.distance = distance;
  }

  static fromPoint(point, bounds, isHorizontal = false) {
    if (!isHorizontal) {
      return new NoodlePoint(
        (point.y - bounds.top) / bounds.height,
        point.x - bounds.left - bounds.width / 2
      );
    }
    else {
      return new NoodlePoint(
        (point.x - bounds.left) / bounds.width,
        point.y - bounds.top - bounds.height / 2
      );
    }
  }

  toPoint(path) {
    let pathPoint = path.getPointAt(path.length * this.offset);
    let normal = path.getNormalAt(path.length * this.offset) * this.distance;
    return pathPoint + normal;
  }

  clone() {
    return new NoodlePoint(this.offset, this.distance);
  }

  getDistance(otherNoodlePoint) {
    return Math.abs(this.offset - otherNoodlePoint.offset);
  }

  static interpolate(point1, point2, offset) {
    let offsetDiff = point2.offset - point1.offset;
    let distanceDiff = point2.distance - point1.distance;
    return new NoodlePoint(
      point1.offset + offsetDiff * offset,
      point1.distance + distanceDiff * offset
    );
  }
}


class Noodle extends Group {
  // TODO V2: Stretch

  constructor(source, path, isHorizontal = false, resolution = 5) {
    super();
    this.isHorizontal = isHorizontal;
    this.resolution = resolution;
    this.source = source;
    this.path = path;
  }

  set source(source) {
    if (this._source) {
      this._source.remove();
      delete this._source;
    }

    this._source = source;
    if (this._source.clipped) {
      this._source._clipItem.remove();
      this._source.clipped = false;
    }

    // Flat list of child path items
    this._sourcePaths = [];

    // If source item is a path, add it
    if (this._source.segments)
      this._sourcePaths.push(this._source);

    // Add all child paths
    for (let path of this._source.getItems({class: 'Path'}))
      this._sourcePaths.push(path);


    // Create Noodle points
    for (let path of this._sourcePaths) {

      // subdivide curves:
      for (let i = path.curves.length - 1; i >= 0; i--){
        let curve = path.curves[i];
        if (!curve.isStraight()) {
          let n = Math.floor(curve.length);
          for (let i = n; i > 0; i--) {
            curve.divideAt(i);
          }
        }
      }

      // map to noodle points
      path._sourcePoints = path.segments.map(segment => {
        return NoodlePoint.fromPoint(segment.point, this._source.bounds, this.isHorizontal);
      });

      // fix for closed paths
      if (path.closed)
        path._sourcePoints.push(path._sourcePoints[0].clone());
    }


    this.addChild(source);
  }

  get source() {
    return this._source;
  }

  set path(path) {
    if (!path) return;

    if (this._path) this._path.remove();

    this._path = path;
    this.addChild(path);


    this._sourcePaths.forEach(path => {
      // Create new set of points based on original offsets and distances
      let outputPoints = [];
      path._sourcePoints.forEach((noodlePoint, i) => {
        let newPoint = noodlePoint.toPoint(this._path);
        // Interpolate more points where needed
        let prevPoint = outputPoints[outputPoints.length - 1];
        if (prevPoint) {
          let prevNoodlePoint = path._sourcePoints[i - 1];
          let dist = noodlePoint.getDistance(prevNoodlePoint) * this._path.length;
          if (dist > this.resolution) {
            let numSteps = dist / this.resolution;
            for (let i = 1; i < numSteps; i++) {
              let offset = i / numSteps;
              let newSubPoint =
                NoodlePoint.interpolate(prevNoodlePoint, noodlePoint, offset)
                  .toPoint(this._path);

              outputPoints.push(newSubPoint);
            }
          }
        }
        outputPoints.push(newPoint);
      });

      // Override source segments
      path.segments = outputPoints;
    });



  }

  get path() {
    return this._path;
  }

  update() {
    this.path = this.path;
    this.path.selected = this.selected;
  }
}


//////


var noo;

project.importSVG('assets/dude3.svg', {expandShapes: true, onLoad:function (group) {
  noo = new Noodle(group, new Path());
  noo.position = view.center;
  // noo.path.selected = true;
}});


var target = view.center;
var speed = 4;
var torque = 4;
var maxLength = 40;

var head = view.center;
var velocity = new Point();

function onFrame(event) {
  if(!noo) return;
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




// var hint;

// function onMouseDown(event) {
//   if (!noo.path) {
//     noo.path = new Path();
//     hint = new Path();
//     hint.strokeColor = 'blue';
//   }
//   noo.path.add(event.point);
//   noo.update();
// }
//
// function onMouseDrag(event) {
//   let vector = event.point - noo.path.lastSegment.point;
//   noo.path.lastSegment.handleOut = vector;
//   noo.path.lastSegment.handleIn = vector.rotate(180);
//
//   hint.segments = [
//     noo.path.lastSegment.point + vector,
//     noo.path.lastSegment.point + vector.rotate(180)
//   ];
//
//   noo.update();
// }
//
// function onMouseMove(event) {
//   if (hint) {
//     hint.segments = [
//       noo.path.lastSegment,
//       event.point
//     ];
//   }
// }
