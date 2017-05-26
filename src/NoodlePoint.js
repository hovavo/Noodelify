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