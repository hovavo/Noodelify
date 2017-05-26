class Noodle extends Group {
  // TODO V2: Stretch

  constructor(source = new Group(), path, isHorizontal = false, resolution = 5) {
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
      for (let i = path.curves.length - 1; i >= 0; i--) {
        let curve = path.curves[i];
        if (!curve.isStraight()) {
          let n = Math.floor(curve.length);
          for (let i = n; i > 0; i--) {
            curve.divideAt(i);
          }
        }
      }

      // map to noodle points
      path._noodlePoints = path.segments.map(segment => {
        return NoodlePoint.fromPoint(segment.point, this._source.bounds, this.isHorizontal);
      });

      // fix for closed paths
      if (path.closed)
        path._noodlePoints.push(path._noodlePoints[0].clone());
    }

    this.addChild(source);
    this.path = this.isHorizontal ?
      new Path([this._source.bounds.leftCenter, this._source.bounds.rightCenter]) :
      new Path([this._source.bounds.topCenter, this._source.bounds.bottomCenter]);
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
      path._noodlePoints.forEach((noodlePoint, i) => {
        let newPoint = noodlePoint.toPoint(this._path);
        // Interpolate more points where needed
        let prevPoint = outputPoints[outputPoints.length - 1];
        if (prevPoint) {
          let prevNoodlePoint = path._noodlePoints[i - 1];
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

  loadSVG(url, onLoad) {
    let _this = this;
    project.importSVG(url, {
      expandShapes: true,
      onLoad: function (group) {
        _this.source = group;
        if (onLoad)
          onLoad(_this);
      }
    });
  }
}

paper.Noodle = Noodle;
class NoodlePoint {
  constructor(offset, distance) {
    this.location = offset;
    this.offset = distance;
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
    let pathPoint = path.getPointAt(path.length * this.location);
    let normal = path.getNormalAt(path.length * this.location) * this.offset;
    return pathPoint + normal;
  }

  clone() {
    return new NoodlePoint(this.location, this.offset);
  }

  getDistance(otherNoodlePoint) {
    return Math.abs(this.location - otherNoodlePoint.location);
  }

  static interpolate(point1, point2, offset) {
    let offsetDiff = point2.location - point1.location;
    let distanceDiff = point2.offset - point1.offset;
    return new NoodlePoint(
      point1.location + offsetDiff * offset,
      point1.offset + distanceDiff * offset
    );
  }
}

paper.NoodlePoint = NoodlePoint;
//# sourceMappingURL=noodelify.js.map
