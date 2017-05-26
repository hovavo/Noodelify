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

paper.NoodlePoint = NoodlePoint;