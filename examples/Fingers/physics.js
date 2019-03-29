
const Engine = Matter.Engine;
const Render = Matter.Render;
const Body = Matter.Body;
const Composite = Matter.Composite;
const Composites = Matter.Composites;
const Constraint = Matter.Constraint;
const MouseConstraint = Matter.MouseConstraint;
const Mouse = Matter.Mouse;
const World = Matter.World;
const Bodies = Matter.Bodies;

// create engine
const engine = Engine.create();
const world = engine.world;

window.physics = {};
window.physics.chains = [];

window.physics.updatePhysics = function (frame) {
  Engine.update(engine, 1000 / 60);
  let force = 0;
  force = Math.sin(frame * 0.1) * 0.02;
  if (force !== 0) {
    window.physics.chains.forEach(chain => {
      chain.bodies.forEach((body, i) => {
        if (i == 0) {
          Body.applyForce(
            body,
            { x: body.position.x, y: body.position.y },
            { x: force * Math.random(), y: 0 }
          );
        }
      });
    });
  }
}

window.physics.addChainsToWorld = function(chains) {
  window.physics.chains = chains;
  World.add(world, chains);
}

window.physics.createChain = function (xPos, length, parts) {
  // add bodies
  let group = Body.nextGroup(true);
  let partSize = length / parts;

  const chain = Composites.stack(xPos, -30, 1, parts, 10, 10, function(x, y) {
    return Bodies.rectangle(x, y, 80, partSize, {
      collisionFilter: { group: group }
    });
  });

  Composites.chain(chain, 0, 0.5, 0, -0.5, {
    stiffness: 1,
    length: 2,
    render: { type: "line" }
  });

  Composite.add(
    chain,
    Constraint.create({
      bodyB: chain.bodies[0],
      pointB: { x: 0, y: 0 },
      pointA: {
        x: chain.bodies[0].position.x,
        y: chain.bodies[0].position.y - partSize / 2
      },
      stiffness: 1
    })
  );

  return chain;
}

