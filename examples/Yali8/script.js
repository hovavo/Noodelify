var bg = new Shape.Rectangle([0, 0], view.size);
bg.fillColor = "white";

var frameCount = 0;

var paths = [
  {
    p: new Path(`M281.5,540.6L281.5,540.6c-52.5,52.5-137.6,52.5-190.1,0l0,0C32.8,482,40.6,384.9,107.9,336.5
L246.1,237c51.1-36.8,57.1-110.6,12.6-155.1l0,0C218.8,42,154.1,42,114.3,81.9l0,0C69.8,126.4,75.8,200.2,126.9,237l138,99.5
C332.2,384.9,340,482,281.5,540.6z`),
    dudes: [],
    population: 1,
    speed: 6
  },
  {
    p: new Path(`M229.5,212.7L91.3,312.2c-39.2,28.2-63.9,72-67.8,120.2c-3.9,48.1,13.4,95.3,47.6,129.5
C103.2,594,145.3,610,187.4,610s84.2-16,116.3-48.1c34.1-34.1,51.5-81.3,47.6-129.5s-28.6-92-67.8-120.2l-138.2-99.5
c-17.2-12.4-28.1-31.6-29.8-52.7s5.9-41.8,20.9-56.8c13.6-13.6,31.7-21.1,51-21.1s37.4,7.5,51,21.1c15,15,22.7,35.7,20.9,56.8
S246.7,200.3,229.5,212.7z`),
    dudes: [],
    population: 1,
    speed: 2
  },
  {
    p: new Path(`M110.2,261.4c-31.5-22.7-51.4-57.9-54.5-96.6S66.5,88.2,94,60.7c25-25,58.1-38.7,93.4-38.7
s68.5,13.7,93.4,38.7c27.5,27.5,41.4,65.4,38.3,104.1s-23,73.9-54.5,96.6l-138.2,99.5c-24.9,17.9-40.6,45.7-43.1,76.3
s8.5,60.6,30.2,82.3c40.7,40.7,107,40.7,147.7,0c21.7-21.7,32.7-51.7,30.2-82.3s-18.2-58.4-43.1-76.3L110.2,261.4z`),
    dudes: [],
    population: 1,
    speed: 4
  }
];

paths[1].posOffset = paths[1].p.position - paths[0].p.position;
paths[2].posOffset = paths[2].p.position - paths[0].p.position;

paths.forEach((path, i) => {
  path.gap = path.p.length / path.population;
  if (i == 0) path.p.position = view.center;
  else path.p.position = view.center + path.posOffset;
  for (var i = 0; i < path.population; i++) {
    var dude = new Noodle();
    dude.loadSVG("../assets/yali.svg", function(noodle) {
      path.dudes.push(noodle);
    });
  }
});

function onFrame(event) {
  paths.forEach(path => {
    if (!path.dudes.length) return;
    path.dudes.forEach(function(noo, i) {
      noo.path = getSubPath(
        path.p,
        frameCount * path.speed + path.gap * i,
        noo.path.length
      );
      noo.update();
    });
  });

  // if (window.stopHook && frameCount >= gap) window.stopHook();

  // if (window.renderHook) window.renderHook(frameCount);

  frameCount++;
}

function getSubPath(path, start, length) {
  start = start % path.length;
  var subPath = path.clone();
  subPath.splitAt(start).remove();
  subPath.splitAt(length).remove();
  return subPath;
}

if (window.startHook) window.startHook();
