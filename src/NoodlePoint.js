class NoodlePoint {

  constructor(locationNormalized, offset, locationSticky, locationStretch, stickySide) {
    this.offset = offset;
    this.locationNormalized = locationNormalized;
    this.locationSticky = locationSticky;
    this.locationStretch = locationStretch;
    this.stickySide = stickySide;
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
    let stickySide;
    let locationStretch;

    if (location < noodle.stretchStart) {
      locationSticky = location;
      stickySide = 1;
    }

    else if (location > noodle.path.length - noodle.stretchEnd) {
      locationSticky = noodle.path.length - location;
      stickySide = -1;
    }

    locationStretch = (location - noodle.stretchStart) / noodle.stretchLength;

    return new NoodlePoint(
      location / noodle.path.length,
      offset,
      locationSticky,
      locationStretch,
      stickySide
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
        return path.length - this.locationSticky;
      }
    }
    return noodle.stretchStart + noodle.stretchLength * this.locationStretch;
  }

  clone() {
    return new NoodlePoint(
      this.locationNormalized,
      this.offset,
      this.locationSticky,
      this.locationStretch,
      this.stickySide
    );
  }

  getDistance(otherNoodlePoint, noodle) {
    return Math.abs(this.toPathLocation(noodle) - otherNoodlePoint.toPathLocation(noodle));
  }

  get sticky() {
    return !isNaN(this.locationSticky);
  }

  get stickyStart() {
    return this.stickySide == 1;
  }

  get stickyEnd() {
    return this.stickySide == -1;
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