class Noodle extends Group {
  // TODO: Stretch between guides
  // TODO: Width getter (/setter?)
  // TODO: More directions?


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
    if (this._source.segments) {
      Noodle.prepareCurves(this._source);
      this._sourcePaths.push(this._source);
    }

    // Add all child paths
    for (let path of this._source.getItems({class: 'Path'})) {
      Noodle.prepareCurves(path);
      this._sourcePaths.push(path);
    }

    // Default path
    this.path = this.isHorizontal ?
      new Path([this._source.bounds.leftCenter, this._source.bounds.rightCenter]) :
      new Path([this._source.bounds.topCenter, this._source.bounds.bottomCenter]);

    // Default stretch
    this._stretchStart = 0;
    this._stretchEnd = 0;

    // Create Noodle points
    this.processSourcePoints();

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

    if (!this._sourcePaths) return;

    this._sourcePaths.forEach(path => {
      // Create new set of points based on original offsets and distances
      if (!path._noodlePoints) return;

      let outputPoints = [];

      path._noodlePoints.forEach((noodlePoint, i) => {
        let newPoint = noodlePoint.toPoint(this);
        // Interpolate more points where needed
        let prevPoint = outputPoints[outputPoints.length - 1];
        if (prevPoint) {
          let prevNoodlePoint = path._noodlePoints[i - 1];
          let dist = noodlePoint.getDistance(prevNoodlePoint, this);
          if (dist > this.resolution) {
            let numSteps = dist / this.resolution;
            for (let i = 1; i < numSteps; i++) {
              let offset = i / numSteps;
              let newSubPoint =
                NoodlePoint.interpolate(prevNoodlePoint, noodlePoint, offset, this)
                  .toPoint(this);

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

  set stretchStart(val) {
    this._stretchStart = val;
    if (this.source)
      this.processSourcePoints();
  }

  get stretchStart() {
    return this._stretchStart;
  }

  set stretchEnd(val) {
    this._stretchEnd = val;
    if (this.source)
      this.processSourcePoints();
  }

  get stretchEnd() {
    return this._stretchEnd;
  }

  get stretchLength() {
    return this.path.length - this.stretchEnd - this.stretchStart;
  }

  get shrinked() {
    return (this.path.length - this.stretchEnd) < this.stretchStart;
  }

  update() {
    this.path = this.path;
    this.path.selected = this.selected;
  }

  processSourcePoints() {
    for (let path of this._sourcePaths) {
      // map to noodle points
      path._noodlePoints = path.segments.map(segment => {
        return NoodlePoint.fromPoint(segment.point, this);
      });

      // fix for closed paths
      if (path.closed)
        path._noodlePoints.push(path._noodlePoints[0].clone());
    }
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

  static prepareCurves(path) {
    for (let i = path.curves.length - 1; i >= 0; i--) {
      let curve = path.curves[i];
      if (!curve.isStraight()) {
        let n = Math.floor(curve.length);
        for (let i = n; i > 0; i--) {
          curve.divideAt(i);
        }
      }
    }
  }
}

paper.Noodle = Noodle;
class NoodlePoint {

  constructor(locationNormalized, offset, locationSticky, locationStretch) {
    this.offset = offset;
    this.locationNormalized = locationNormalized;
    this.locationSticky = locationSticky;
    this.locationStretch = locationStretch;
  }

  static fromPoint(point, noodle) {
    let location;
    let boundsThickness;
    let offset;

    if (!noodle.isHorizontal) {
      location = point.y - noodle.source.bounds.top;
      boundsThickness = noodle.source.bounds.width;
      offset = point.x - noodle.source.bounds.left - boundsThickness / 2;
    }
    else {
      location = point.x - noodle.source.bounds.left;
      boundsThickness = noodle.source.bounds.height;
      offset = point.y - noodle.source.bounds.top - boundsThickness / 2
    }

    return NoodlePoint.fromPathLocation(location, offset, noodle);
  }

  static fromPathLocation(location, offset, noodle) {
    let locationSticky;
    let locationStretch;

    if (location < noodle.stretchStart)
      locationSticky = location;

    else if (location > noodle.path.length - noodle.stretchEnd)
      locationSticky = location - noodle.path.length;

    locationStretch = (location - noodle.stretchStart) / noodle.stretchLength;

    return new NoodlePoint(
      location / noodle.path.length,
      offset,
      locationSticky,
      locationStretch
    );
  }

  toPoint(noodle) {
    let path = noodle.path;
    let loc = this.toPathLocation(noodle);
    let pathPoint = path.getPointAt(loc);
    let normal = path.getNormalAt(loc) * this.offset;
    return pathPoint + normal;
  }

  toPathLocation(noodle) {
    let path = noodle.path;

    if (noodle.shrinked) {
      return path.length * this.locationNormalized;
    }

    if (this.sticky) {
      if (this.stickyStart) {
        return this.locationSticky;
      }
      else if (this.stickyEnd) {
        return path.length + this.locationSticky;
      }
    }
    return noodle.stretchStart + noodle.stretchLength * this.locationStretch;
  }

  clone() {
    return new NoodlePoint(
      this.locationNormalized,
      this.offset,
      this.locationSticky,
      this.locationStretch
    );
  }

  getDistance(otherNoodlePoint, noodle) {
    return Math.abs(this.toPathLocation(noodle) - otherNoodlePoint.toPathLocation(noodle));
  }

  get sticky() {
    return !isNaN(this.locationSticky);
  }

  get stickySide() {
    if (this.sticky) {
      return (this.locationSticky > 0) ? 1 : 0;
    }
    return -1;
  }

  get stickyStart() {
    return this.stickySide == 1;
  }

  get stickyEnd() {
    return this.stickySide == 0;
  }

  static interpolate(point1, point2, time, noodle) {
    let startLocation = point1.toPathLocation(noodle);
    let endLocation = point2.toPathLocation(noodle);
    let locationDiff = endLocation - startLocation;
    let offsetDiff = point2.offset - point1.offset;
    return NoodlePoint.fromPathLocation(
      startLocation + locationDiff * time,
      point1.offset + offsetDiff * time,
      noodle
    );
  }
}

paper.NoodlePoint = NoodlePoint;
//# sourceMappingURL=noodelify.js.map
