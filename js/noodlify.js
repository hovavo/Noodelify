class Noodle extends Group {
  // TODO V2: Off grid points?
  // TODO V2: Stretch

  constructor(source, path, resolution = 5) {
    super();
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
      return {
        offset: (segment.point.y - this._source.bounds.top) / this._source.bounds.height,
        distance: segment.point.x - this._source.bounds.left - this._source.bounds.width / 2
      }
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
      let newPoint = this._calculatePoint(localPoint);
      // Interpoate more points where needed
      let prevPoint = newPoints[newPoints.length - 1];
      if (prevPoint) {
        let prevLocalPoint = this._sourcePoints[i - 1];
        let dist = prevPoint.getDistance(newPoint);
        if (dist > this.resolution) {
          let numSteps = Math.floor(dist / this.resolution);
          for (let i = 1; i < numSteps; i++) {
            let offset = i / numSteps;
            let newSubPoint =
              this._calculatePoint(this._interpolatePoints(prevLocalPoint, localPoint, offset));
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

  _calculatePoint(point) {
    let pathPoint = this._path.getPointAt(this._path.length * point.offset);
    let normal = this._path.getNormalAt(this._path.length * point.offset) * point.distance;
    return pathPoint + normal;
  }

  _interpolatePoints(point1, point2, offset) {
    let offsetDiff = point2.offset - point1.offset;
    let distanceDiff = point2.distance - point1.distance;
    return {
      offset: point1.offset + offsetDiff * offset,
      distance: point1.distance + distanceDiff * offset
    }
  }
}

//////


tool.minDistance = 5;

var s = new Path(`M26.5,2 2.5,2.4 1.8,26.5 23.8,25.8 23.8,7.8 14.8,7.8 14.8,16.8 19.8,16.8 18.5,7.2 
	5.8,7.5 5.8,17.8 10.2,16.8 9.8,6.2 10.2,40.8 3.2,41.5 2.8,74.2 22.8,74.5 22.8,38.8 16.5,39.5 17.8,102.2 5.8,102.7 7.2,45.8 
	9.8,45.8 11.8,99.8`);

s.strokeColor = 'black';

var noo = new Noodle(s);

function onMouseDown(event) {
  noo.path = new Path();
  noo.update();
}

function onMouseDrag(event) {
  noo.path.add(event.point);
  noo.update();
}