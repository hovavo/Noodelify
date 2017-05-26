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

paper.Noodle = Noodle;