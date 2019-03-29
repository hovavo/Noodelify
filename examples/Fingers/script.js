let frameCount = 0;

const bg = new Shape.Rectangle([0, 0], view.size);
bg.fillColor = 'white';

const xGap = 94;
const parts = 3;
const length = [250, 300, 270, 190];
const fingers = length.map((length, i) => {
  return {
    length: length * 1.2,
    parts: parts,
    skin: new Noodle(),
    chain: window.physics.createChain(xGap * (i + 1), length, parts)
  }
});

fingers.forEach(finger => {
  finger.skin.loadSVG('../assets/finger.svg', (skin) => {
    skin.stretchStart = 10;
    skin.stretchEnd = 50;
  });
  
})

window.physics.addChainsToWorld(fingers.map(finger => finger.chain));

function onFrame(event) {


  window.physics.updatePhysics(frameCount);

  fingers.forEach(function (finger, i) {
    const path = pathFromChain(finger.chain, finger.length);
    path.smooth();
    finger.skin.path = path;
    finger.skin.update();
  });

  if (window.stopHook && frameCount >= 1500)
    window.stopHook()

  if (window.renderHook && (frameCount % 2 == 0))
    window.renderHook(frameCount);

  frameCount++;
}


function pathFromChain(chain, length) {
  const points = [];
  chain.bodies.forEach((body, i) => {
    const subPath = pathFromBody(body, length / parts);
    if (i == 0) {
      points.push(subPath.segments[0].point);
    }
    points.push(subPath.segments[1].point);
  })
  return new Path(points);
}

function pathFromBody(body, length) {
  const path = new Path([{
    x: body.position.x,
    y: body.position.y - length / 2
  }, {
    x: body.position.x,
    y: body.position.y + length / 2
  }]);

  path.rotate(body.angle * (180 / Math.PI));

  return path;
}


if (window.startHook)
  window.startHook();
