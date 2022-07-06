// linking the matter engine in our index.html creates a Matter variable, we are destructuring the engine, render, etc. from that
const { Engine, Render, Runner, Composite, Bodies, Body, Events } = Matter;
const mazeContainer = document.querySelector(".maze");

const youWin = document.querySelector(".winner");
const replayButton = document.querySelector('#new-game');

generateGame();

function generateGame(){
  const cellsHorizontal = 15;
  const cellsVertical = 12;
  const width = window.innerWidth;
  const height = window.innerHeight;

  const unitLengthX = width / cellsHorizontal;
  const unitLengthY = height / cellsVertical;

  // creates an object that contains a world object inside
  const engine = Engine.create();
  engine.gravity.y = 0;
  // destructuring world object from engine object
  const { world } = engine;
  // pass in object, element: tell render where we want the representation of everything (canvas) in the html document, engine: what engine to use, options: options like height and width
  const render = Render.create({
    element: mazeContainer,
    engine: engine,
    options: {
      wireframes: false,
      width: width,
      height: height,
      background: "#07020D",
    },
  });


  Render.run(render);
  Runner.run(Runner.create(), engine);

  // Walls
  const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }),
  ];

  Composite.add(world, walls);

  // Maze generation

  const shuffle = (arr) => {
    let counter = arr.length;

    while (counter > 0) {
      const index = Math.floor(Math.random() * counter);

      counter--;

      const temp = arr[counter];
      arr[counter] = arr[index];
      arr[index] = temp;
    }

    return arr;
  };

  const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

  const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));
  const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

  const startRow = Math.floor(Math.random() * cellsVertical);
  const startColumn = Math.floor(Math.random() * cellsHorizontal);

  const stepThroughCell = (row, column) => {
    // If i have visited the cell at [row,column], then return
    if (grid[row][column]) {
      return;
    }
    // Mark this cell as being visited
    grid[row][column] = true;
    // Assemble randomly-ordered list of neighbors
    const neighbors = shuffle([
      [row - 1, column, "up"],
      [row, column + 1, "right"],
      [row + 1, column, "down"],
      [row, column - 1, "left"],
    ]);
    // For each neighbor...
    for (let neighbor of neighbors) {
      const [nextRow, nextColumn, direction] = neighbor;

      // See if that neighbor is out of bounds
      if (
        nextRow < 0 ||
        nextRow >= cellsVertical ||
        nextColumn < 0 ||
        nextColumn >= cellsHorizontal
      ) {
        continue;
      }

      // If we have visited that neighbor, continue to next neighbor
      if (grid[nextRow][nextColumn]) {
        continue;
      }
      // Remove a wall from either horizontals or verticals
      if (direction === "left") {
        verticals[row][column - 1] = true;
      } else if (direction === "right") {
        verticals[row][column] = true;
      } else if (direction === "up") {
        horizontals[row - 1][column] = true;
      } else if (direction === "down") {
        horizontals[row][column] = true;
      }
      stepThroughCell(nextRow, nextColumn);
      // Visit that next cell
    }
  };

  stepThroughCell(startRow, startColumn);

  horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
      if (open) {
        return;
      }
      const wall = Bodies.rectangle(
        columnIndex * unitLengthX + unitLengthX / 2,
        rowIndex * unitLengthY + unitLengthY,
        unitLengthX,
        5,
        {
          label: "wall",
          isStatic: true,
          friction: 0,
          render: {
            fillStyle: "#F0F7EE",
          },
        }
      );

      Composite.add(world, wall);
    });
  });

  verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
      if (open) {
        return;
      }
      const wall = Bodies.rectangle(
        columnIndex * unitLengthX + unitLengthX,
        rowIndex * unitLengthY + unitLengthY / 2,
        5,
        unitLengthY,
        {
          label: "wall",
          isStatic: true,
          render: {
            fillStyle: "#F0F7EE",
          },
        }
      );
      Composite.add(world, wall);
    });
  });

  const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.7,
    unitLengthY * 0.7,
    {
      label: "goal",
      isStatic: true,
      render: {
        fillStyle: "#009F93",
      },
    }
  );
  Composite.add(world, goal);

  // Ball
  const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
  const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
    label: "ball",
    render: {
      fillStyle: "#6969B3",
    },
  });

  Composite.add(world, ball);

  document.addEventListener("keydown", (event) => {
    const { x, y } = ball.velocity;
    const velocity = 8;
    if (event.key === "w" || event.key === "ArrowUp") {
      Body.setVelocity(ball, { x, y: -velocity });
    }
    if (event.key === "a" || event.key === "ArrowLeft") {
      Body.setVelocity(ball, { x: -velocity, y });
    }
    if (event.key === "s" || event.key === "ArrowDown") {
      Body.setVelocity(ball, { x, y: velocity });
    }
    if (event.key === "d" || event.key === "ArrowRight") {
      Body.setVelocity(ball, { x: velocity, y });
    }
  });

  document.addEventListener("keyup", (event) => {
    const { x, y } = ball.velocity;
    if (event.key === "w" || event.key === "ArrowUp") {
      Body.setVelocity(ball, { x, y: 0 });
    }
    if (event.key === "a" || event.key === "ArrowLeft") {
      Body.setVelocity(ball, { x: 0, y });
    }
    if (event.key === "s" || event.key === "ArrowDown") {
      Body.setVelocity(ball, { x, y: 0 });
    }
    if (event.key === "d" || event.key === "ArrowRight") {
      Body.setVelocity(ball, { x: 0, y });
    }
    
  });
  // Win Condition

  Events.on(engine, "collisionStart", (event) => {
    event.pairs.forEach((collision) => {
      const labels = ["ball", "goal"];

      if (
        labels.includes(collision.bodyA.label) &&
        labels.includes(collision.bodyB.label)
      ) {
        youWin.classList.remove("hidden");
        engine.gravity.y = 1;
        world.bodies.forEach((body) => {
          if (body.label === "wall") {
            Body.setStatic(body, false);
          }
        });
      }
    });
  });

  replayButton.addEventListener('click', (event) => {
    event.preventDefault();
    Composite.clear(world);
    Engine.clear(engine);
    Render.stop(render);
    render.canvas.remove();
    render.canvas = null;
    render.context = null;
    render.textures = {};
    document.querySelector('.winner').classList.add('hidden');
    generateGame();
  })
};
