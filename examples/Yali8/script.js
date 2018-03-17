var bg = new Shape.Rectangle([0, 0], view.size);
bg.fillColor = "#efefef";

var frameCount = 0;
var loopFrames = 1000;

var paths = [
  {
    p: new Path(`M763.3,572.7c49.1-49.2,42.6-130.9-14-171.5l-115.9-83.6c-43-30.9-48-92.9-10.6-130.3l0,0
    c33.4-33.5,87.8-33.5,121.3,0l0,0c37.4,37.4,32.4,99.4-10.6,130.3l-116.2,83.6c-56.5,40.7-63.1,122.2-13.9,171.5l0,0
    C647.7,616.8,719.2,616.8,763.3,572.7L763.3,572.7z`),
    noodels: [],
    speed: 3,
    skin: "yali1.svg"
  },
  {
    p: new Path(`M618.5,338.2c-26.4-19.1-43.2-48.6-45.7-81.2c-2.6-32.5,9-64.3,32.2-87.5
    c21-21,48.8-32.5,78.4-32.5s57.6,11.5,78.4,32.5c23.1,23.1,34.7,55,32.2,87.5c-2.6,32.5-19.3,62.1-45.7,81.2l-116.2,83.6
    c-21,15-34.1,38.4-36.2,64.1c-2.1,25.7,7.1,50.9,25.4,69.2c34.2,34.2,89.9,34.2,124.1,0c18.2-18.2,27.4-43.5,25.4-69.2
    c-2.1-25.7-15.3-49-36.2-64.1L618.5,338.2z`),
    noodels: [],
    speed: 1,
    skin: "yali2.svg"
  },
  {
    p: new Path(`M718.8,297.2l-116.2,83.6c-32.9,23.6-53.7,60.4-56.9,100.9c-3.3,40.4,11.3,80.1,40,108.8
      c26.9,26.9,62.3,40.4,97.8,40.4s70.7-13.5,97.8-40.4c28.7-28.7,43.3-68.3,40-108.8c-3.3-40.5-24.1-77.3-56.9-100.9L648,297.2
      c-14.5-10.4-23.6-26.5-25.1-44.3c-1.4-17.7,4.9-35.2,17.6-47.7c11.4-11.4,26.6-17.7,42.9-17.7s31.5,6.3,42.9,17.7
      c12.6,12.6,19.1,30,17.6,47.7C742.3,270.6,733.3,286.8,718.8,297.2z`),
    noodels: [],
    speed: 2,
    skin: "yali3.svg"
  }
];

project.importSVG('yali8Caption.svg', function(caption) {
  caption.position = view.center + [0, 245];
  console.log(caption.position)
});

paths[1].posOffset = paths[1].p.position - paths[0].p.position;
paths[2].posOffset = paths[2].p.position - paths[0].p.position;

paths.forEach((path, i) => {
  if (i == 0) path.p.position = view.center - [0, 30];
  else path.p.position = view.center + path.posOffset - [0, 30];
  var noodle = new Noodle();
  noodle.loadSVG(path.skin, function(noodle) {
    path.noodels.push(noodle);
  });
});

function onFrame(event) {
  paths.forEach(path => {
    if (!path.noodels.length) return;
    path.noodels.forEach(function(noo, i) {
      noo.path = getSubPath(
        path.p,
        frameCount * (path.speed / loopFrames) * path.p.length,
        noo.path.length
      );
      noo.update();
    });
  });

  if (window.stopHook && frameCount >= (loopFrames + 3)) window.stopHook();

  if (window.renderHook) window.renderHook(frameCount);

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
