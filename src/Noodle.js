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