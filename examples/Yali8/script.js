var bg = new Shape.Rectangle([0, 0], view.size);
bg.fillColor = "#efefef";

var frameCount = 0;

var paths = [
  {
    p: new Path(`M761.1,567.6c47.8-47.9,41.4-127.3-13.6-166.8l-112.8-81.3c-41.8-30.1-46.7-90.4-10.3-126.8l0,0
    c32.5-32.6,85.4-32.6,118,0l0,0c36.4,36.4,31.5,96.7-10.3,126.8l-113,81.3c-55,39.6-61.4,118.9-13.5,166.8l0,0
    C648.7,610.5,718.2,610.5,761.1,567.6L761.1,567.6z`),
    dudes: [],
    population: 1,
    speed: 6,
    skin: 'yali1.svg'
  },
  {
    p: new Path(`M620.3,339.4c-25.7-18.6-42-47.3-44.5-79c-2.5-31.6,8.8-62.6,31.3-85.1
    c20.4-20.4,47.5-31.6,76.3-31.6s56,11.2,76.3,31.6c22.5,22.5,33.8,53.5,31.3,85.1c-2.5,31.6-18.8,60.4-44.5,79l-113,81.3
    c-20.4,14.6-33.2,37.4-35.2,62.4s6.9,49.5,24.7,67.3c33.3,33.3,87.5,33.3,120.7,0c17.7-17.7,26.7-42.3,24.7-67.3
    c-2-25-14.9-47.7-35.2-62.4L620.3,339.4z`),
    dudes: [],
    population: 1,
    speed: 2,
    skin: 'yali2.svg'
  },
  {
    p: new Path(`M717.8,299.6l-113,81.3c-32,23-52.2,58.8-55.4,98.2c-3.2,39.3,11,77.9,38.9,105.8
    c26.2,26.2,60.6,39.3,95.1,39.3s68.8-13.1,95.1-39.3c27.9-27.9,42.1-66.4,38.9-105.8c-3.2-39.4-23.4-75.2-55.4-98.2l-113-81.3
    c-14.1-10.1-23-25.8-24.4-43.1c-1.4-17.2,4.8-34.2,17.1-46.4c11.1-11.1,25.9-17.2,41.7-17.2s30.6,6.1,41.7,17.2
    c12.3,12.3,18.6,29.2,17.1,46.4S731.9,289.4,717.8,299.6z`),
    dudes: [],
    population: 1,
    speed: 4,
    skin: 'yali3.svg'
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
    dude.loadSVG(path.skin, function(noodle) {
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
