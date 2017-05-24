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

  constructor(source, path, isHorizontal = false, resolution = 2) {
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
      let newPoints = [];
      path._sourcePoints.forEach((noodlePoint, i) => {
        let newPoint = noodlePoint.toPoint(this._path);
        // Interpolate more points where needed
        let prevPoint = newPoints[newPoints.length - 1];
        if (prevPoint) {
          let prevLocalPoint = path._sourcePoints[i - 1];
          let dist = prevPoint.getDistance(newPoint);
          if (dist > this.resolution) {
            let numSteps = dist / this.resolution;
            for (let i = 1; i < numSteps; i++) {
              let offset = i / numSteps;
              let newSubPoint =
                NoodlePoint.interpolate(prevLocalPoint, noodlePoint, offset).toPoint(this._path);

              newPoints.push(newSubPoint);
            }
          }
        }
        newPoints.push(newPoint);
      });

      // Override source segments
      path.segments = newPoints;
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


tool.minDistance = 5;

var noo;

project.importSVG('assets/dude2.svg', {expandShapes: true, onLoad:function (group) {
  noo = new Noodle(group, new Path.Rectangle(view.center, 100));
  // noo.selected = true;
}});


function onMouseDown(event) {
  noo.path = new Path();
  noo.update();
}

function onMouseDrag(event) {
  noo.path.add(event.point);
  noo.path.smooth();
  noo.update();
}