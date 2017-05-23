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
  // TODO V2: Off grid points?
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
    this._sourcePoints = source.segments.map(segment => {
      return NoodlePoint.fromPoint(segment.point, this._source.bounds, this.isHorizontal);
    });

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


    // Create new set of points based on original offsets and distances
    let newPoints = [];

    this._sourcePoints.forEach((localPoint, i) => {
      let newPoint = localPoint.toPoint(this._path);
      // Interpoate more points where needed
      let prevPoint = newPoints[newPoints.length - 1];
      if (prevPoint) {
        let prevLocalPoint = this._sourcePoints[i - 1];
        let dist = prevPoint.getDistance(newPoint);
        if (dist > this.resolution) {
          let numSteps = dist / this.resolution;
          for (let i = 1; i < numSteps; i++) {
            let offset = i / numSteps;
            let newSubPoint =
              NoodlePoint.interpolate(prevLocalPoint, localPoint, offset).toPoint(this._path);

            newPoints.push(newSubPoint);
          }
        }
      }
      newPoints.push(newPoint);
    });


    // Override source segments
    this._source.segments = newPoints;

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

var s = new Path(`M26.5,2 2.5,2.4 1.8,26.5 23.8,25.8 23.8,7.8 14.8,7.8 14.8,16.8 19.8,16.8 18.5,7.2 
	5.8,7.5 5.8,17.8 10.2,16.8 9.8,6.2 10.2,40.8 3.2,41.5 2.8,74.2 22.8,74.5 22.8,38.8 16.5,39.5 17.8,102.2 5.8,102.7 7.2,45.8 
	9.8,45.8 11.8,99.8`);

s.strokeColor = 'black';

var noo = new Noodle(s);
// noo.selected = true;

function onMouseDown(event) {
  noo.path = new Path();
  noo.update();
}

function onMouseDrag(event) {
  noo.path.add(event.point);
  noo.update();
}