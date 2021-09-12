import * as Plot from "https://cdn.skypack.dev/@observablehq/plot@0.2";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer("playground")).define("playground", ["game", "gridSize", "CircuitGrid", "Direction", "Array2D"], function (game, gridSize, CircuitGrid, Direction, Array2D) {
    return (
      game(
        gridSize * 3,
        (circuit) => {
          const WIRE_STOP = 12;
          CircuitGrid.insert(circuit, [0, 2], Direction.UP, CircuitGrid.SOURCE, {
            num: 2
          });
          for (let i = 1; i < WIRE_STOP; i++) {
            CircuitGrid.insert(circuit, [i, 2], Direction.UP, CircuitGrid.WIRE);
          }
          CircuitGrid.insert(circuit, [WIRE_STOP, 2], Direction.UP, CircuitGrid.BOX, {
            func: (vec, item) =>
            (circuit.items = circuit.items.filter(
              (otherItem) => otherItem !== item
            )),
            label: "📸"
          });

          CircuitGrid.insert(circuit, [0, 1], Direction.UP, CircuitGrid.SOURCE, {
            num: 1
          });
          for (let i = 1; i < WIRE_STOP; i++) {
            CircuitGrid.insert(circuit, [i, 1], Direction.UP, CircuitGrid.WIRE);
          }
          CircuitGrid.insert(circuit, [WIRE_STOP, 1], Direction.UP, CircuitGrid.BOX, {
            func: (vec, item) =>
            (circuit.items = circuit.items.filter(
              (otherItem) => otherItem !== item
            )),
            label: "📸"
          });

          CircuitGrid.insert(circuit, [0, 0], Direction.UP, CircuitGrid.SOURCE, {
            num: 0
          });
          for (let i = 1; i < WIRE_STOP; i++) {
            CircuitGrid.insert(circuit, [i, 0], Direction.UP, CircuitGrid.WIRE);
          }
          CircuitGrid.insert(circuit, [WIRE_STOP, 0], Direction.UP, CircuitGrid.BOX, {
            func: (vec, item) =>
            (circuit.items = circuit.items.filter(
              (otherItem) => otherItem !== item
            )),
            label: "📸"
          });

          CircuitGrid._propogateWireNumber(
            circuit.sourceWireFromWireNumber,
            Array2D.getEntry(circuit.grid, [0, 2]),
            100
          );
          CircuitGrid._propogateWireNumber(
            circuit.sourceWireFromWireNumber,
            Array2D.getEntry(circuit.grid, [0, 1]),
            101
          );

          CircuitGrid._propogateWireNumber(
            circuit.sourceWireFromWireNumber,
            Array2D.getEntry(circuit.grid, [0, 0]),
            102
          );
        },
        (circuit, width, height, context) => { }
      )
    )
  });
  main.variable(observer("viewof buttonClicked")).define("viewof buttonClicked", ["Inputs"], function (Inputs) {
    return (
      Inputs.button("Run on QuantumCat", {})
    )
  });
  main.variable(observer("buttonClicked")).define("buttonClicked", ["Generators", "viewof buttonClicked"], (G, _) => G.input(_));
  main.variable(observer("plot")).define(["data"], function (data) {
    return (
      Plot.plot({
        marks: [Plot.barY(data, { x: "outcome", y: "count" })]
      })
    )
  });
  main.variable(observer("data")).define("data", ["realCircuitJSON"], function (realCircuitJSON) {
    return fetch("https://api.quantumcat.io/executeCircuit", {
      method: "post",
      body: JSON.stringify(realCircuitJSON)
    })
      .then(function (response) {
        return response.json();
      })
      .then((result) =>
        Object.entries(result).map(([outcome, count]) => ({
          outcome,
          count
        }))
      );
  }
  );
  main.variable(observer("realCircuitJSON")).define("realCircuitJSON", ["buttonClicked", "playground"], function (buttonClicked, playground) {
    buttonClicked;
    let result = { operations: [] };
    let wireNumber = 0;
    for (const operations of Object.values(playground.getCircuit())) {
      for (const operation of operations) {
        if (operation === "X" || operation === "Z" || operation === "H") {
          const object = {};
          object[`${operation.toLowerCase()}_gate`] = [wireNumber];
          result.operations.push(object);
        }
      }
      wireNumber++;
    }
    result.operations.push({ measure: [0, 1, 2] });
    return result;
  }
  );
  main.variable(observer("gridSize")).define("gridSize", function () {
    return (
      64
    )
  });
  main.variable(observer("game")).define("game", ["gridSize", "DOM", "InputState", "Direction", "width", "Bool", "Vec2", "Array2D", "CircuitGrid", "Item", "Draw", "invalidation", "Graph"], function (gridSize, DOM, InputState, Direction, width, Bool, Vec2, Array2D, CircuitGrid, Item, Draw, invalidation, Graph) {
    return (
      (height = gridSize * 3, onInit = () => { }, onLoop = () => { }) => {
        const context = DOM.context2d(64 * 10, height);
        const canvas = context.canvas;
        const input = new InputState(canvas);

        const circuit = {
          grid: [[]],
          wireCounter: 0,
          sourceWireFromWireNumber: new Map(),
          items: [],
          score: 0
        };
        onInit(circuit);

        let prevMousePos = [0, 0];
        let hoverIndex2D = [0, 0];
        let prevHoverIndex2D = [0, 0];
        let hoverDirection = Direction.UP;

        let frame;
        (function tick() {
          frame = requestAnimationFrame(tick);
          context.clearRect(0, 0, width, height);

          if (!Bool.fromVec2sAreEqual(input.mouse, prevMousePos)) {
            hoverIndex2D = Vec2.mulByNumber(input.mouse, 1 / gridSize).map(
              Math.floor
            );
          }
          prevMousePos = input.mouse;

          if (input.isKeyPressed("ArrowLeft")) {
            hoverIndex2D = Vec2.add(hoverIndex2D, [-1, 0]);
          }
          if (input.isKeyPressed("ArrowRight")) {
            hoverIndex2D = Vec2.add(hoverIndex2D, [1, 0]);
          }
          if (input.isKeyPressed("ArrowUp")) {
            hoverIndex2D = Vec2.add(hoverIndex2D, [0, -1]);
          }
          if (input.isKeyPressed("ArrowDown")) {
            hoverIndex2D = Vec2.add(hoverIndex2D, [0, 1]);
          }

          if (!Bool.fromVec2sAreEqual(prevHoverIndex2D, hoverIndex2D)) {
            hoverDirection = Direction.betweenVec2s(prevHoverIndex2D, hoverIndex2D);
          }

          const hoverEntry = Array2D.getEntry(circuit.grid, hoverIndex2D);
          const hoverOverwritable = hoverEntry?.type === CircuitGrid.WIRE || hoverEntry?.type === CircuitGrid.BOX;

          if (hoverOverwritable) {
            if (input.isButtonPressed('left')) {
              if (hoverEntry.type === CircuitGrid.WIRE) {
                CircuitGrid.remove(circuit, hoverIndex2D);
                CircuitGrid.insert(
                  circuit,
                  hoverIndex2D,
                  hoverDirection,
                  CircuitGrid.BOX,
                  {
                    func: (vec) =>
                      Vec2.leftMulBy4x4Matrix(
                        [
                          [0, 1],
                          [1, 0]
                        ],
                        vec
                      ),
                    label: "X"
                  }
                );
              } else if (hoverEntry?.data?.label === 'X') {
                CircuitGrid.remove(circuit, hoverIndex2D);
                CircuitGrid.insert(
                  circuit,
                  hoverIndex2D,
                  hoverDirection,
                  CircuitGrid.BOX,
                  {
                    func: (vec) =>
                      Vec2.leftMulBy4x4Matrix(
                        [
                          [1, 0],
                          [0, -1]
                        ],
                        vec
                      ),
                    label: "Z"
                  }
                );
              } else if (hoverEntry?.data?.label === 'Z') {
                CircuitGrid.remove(circuit, hoverIndex2D);
                CircuitGrid.insert(
                  circuit,
                  hoverIndex2D,
                  hoverDirection,
                  CircuitGrid.BOX,
                  {
                    func: (vec) =>
                      Vec2.leftMulBy4x4Matrix(
                        [
                          [1 / Math.sqrt(2), 1 / Math.sqrt(2)],
                          [1 / Math.sqrt(2), -1 / Math.sqrt(2)]
                        ],
                        vec
                      ),
                    label: "H"
                  }
                );
              } else if (hoverEntry?.data?.label === 'H') {
                CircuitGrid.remove(circuit, hoverIndex2D);
                CircuitGrid.insert(
                  circuit,
                  hoverIndex2D,
                  hoverDirection,
                  CircuitGrid.WIRE
                );
              }
            }
            if (input.isKeyDown("x")) {
              CircuitGrid.remove(circuit, hoverIndex2D);
              CircuitGrid.insert(
                circuit,
                hoverIndex2D,
                hoverDirection,
                CircuitGrid.BOX,
                {
                  func: (vec) =>
                    Vec2.leftMulBy4x4Matrix(
                      [
                        [0, 1],
                        [1, 0]
                      ],
                      vec
                    ),
                  label: "X"
                }
              );
            }
            if (input.isKeyDown("z")) {
              CircuitGrid.remove(circuit, hoverIndex2D);
              CircuitGrid.insert(
                circuit,
                hoverIndex2D,
                hoverDirection,
                CircuitGrid.BOX,
                {
                  func: (vec) =>
                    Vec2.leftMulBy4x4Matrix(
                      [
                        [1, 0],
                        [0, -1]
                      ],
                      vec
                    ),
                  label: "Z"
                }
              );
            }
            if (input.isKeyDown("h")) {
              CircuitGrid.remove(circuit, hoverIndex2D);
              CircuitGrid.insert(
                circuit,
                hoverIndex2D,
                hoverDirection,
                CircuitGrid.BOX,
                {
                  func: (vec) =>
                    Vec2.leftMulBy4x4Matrix(
                      [
                        [1 / Math.sqrt(2), 1 / Math.sqrt(2)],
                        [1 / Math.sqrt(2), -1 / Math.sqrt(2)]
                      ],
                      vec
                    ),
                  label: "H"
                }
              );
            }
          }
          if (input.isKeyPressed("i")) {
            console.log(Array2D.getEntry(circuit.grid, hoverIndex2D));
          }
          if (input.isKeyDown("backspace")) {
            const wire = Array2D.getEntry(circuit.grid, hoverIndex2D);
            if (wire?.type !== CircuitGrid.SOURCE && wire?.data?.label !== "📸") {
              CircuitGrid.remove(circuit, hoverIndex2D);
              CircuitGrid.insert(circuit, hoverIndex2D);
            }
          }

          for (const [wireNumber, wire] of circuit.sourceWireFromWireNumber) {
            if (wire.time % 60 === 0 && wire.adjacentWires.size > 0) {
              Item.make(wire, [1, 0], gridSize, circuit.items);
            }
            wire.time++;
          }

          for (const item of circuit.items) {
            const index2D = [
              Math.floor(item.position[0] / gridSize),
              Math.floor(item.position[1] / gridSize)
            ];
            const wire = Array2D.getEntry(circuit.grid, index2D);
            if (wire) {
              if (!Item.move(item, circuit.items, circuit.grid, gridSize)) {
                circuit.items = circuit.items.filter(
                  (otherItem) => otherItem !== item
                );
              }
            } else {
              circuit.items = circuit.items.filter((otherItem) => otherItem !== item);
            }
          }

          Draw.grid(width, height, gridSize, context);
          Draw.cursorGridHighlight(hoverIndex2D, gridSize, context);
          Draw.cursorGridHighlight(prevHoverIndex2D, gridSize, context);
          onLoop(circuit, width, height, context);

          if (!Bool.fromVec2sAreEqual(prevHoverIndex2D, hoverIndex2D)) {
            prevHoverIndex2D = hoverIndex2D;
          }

          for (let x = 0; x < width / gridSize; x++) {
            for (let y = 0; y < height / gridSize; y++) {
              const entry = Array2D.getEntry(circuit.grid, [x, y]);
              if (entry?.type === CircuitGrid.WIRE) {
                Draw.wire(entry, gridSize, context);
              } else if (entry?.type === CircuitGrid.BOX) {
                Draw.wire(entry, gridSize, context);
              }
            }
          }

          for (const item of circuit.items) {
            Draw.item(item, context);
          }

          for (let x = 0; x < width / gridSize; x++) {
            for (let y = 0; y < height / gridSize; y++) {
              const entry = Array2D.getEntry(circuit.grid, [x, y]);
              if (entry?.type === CircuitGrid.BOX) {
                Draw.box(entry, gridSize, context);
              } else if (entry?.type === CircuitGrid.SOURCE) {
                Draw.source(entry, gridSize, context);
              }
            }
          }

          if (circuit.score > 9) {
            Draw.winCover(width, height, context);
          }

          input.frameReset();
        })();
        invalidation.then(() => cancelAnimationFrame(frame));

        canvas.getCircuit = () => {
          const result = [];
          for (const [wireNumber, sourceWire] of circuit.sourceWireFromWireNumber) {
            for (const wire of Graph.walk(sourceWire, (v) => v.adjacentWires)) {
              if (wire.type === CircuitGrid.BOX) {
                const num = circuit.sourceWireFromWireNumber.get(wireNumber).data.num;
                if (!result[num]) result[num] = [];
                result[num].push(wire.data.label);
              }
            }
          }
          return result;
        };

        return canvas;
      }
    )
  });
  main.variable(observer("Item")).define("Item", ["Vec2", "gridSize", "Direction", "Array2D", "CircuitGrid", "Bool"], function (Vec2, gridSize, Direction, Array2D, CircuitGrid, Bool) {
    const _targetPosition = (wire, wirePosition) => {
      const centerOfGridSquare = Vec2.fromIndexAndScale(wire.index2D, gridSize);
      if (wirePosition < 0.5) {
        if (!wire.fromWire) return false;
        const fromDir = Direction.betweenVec2s(
          wire.index2D,
          wire.fromWire.index2D
        );
        const fromStartPosition = Vec2.add(
          centerOfGridSquare,
          Vec2.mulByNumber(Vec2.unitFromDirection(fromDir), gridSize / 2)
        );

        return Vec2.lerp(fromStartPosition, centerOfGridSquare, wirePosition * 2);
      } else {
        if (!wire.toWire) return false;
        const toDir = Direction.betweenVec2s(wire.index2D, wire.toWire.index2D);
        const toEndPosition = Vec2.add(
          centerOfGridSquare,
          Vec2.mulByNumber(Vec2.unitFromDirection(toDir), gridSize / 2)
        );

        return Vec2.lerp(
          centerOfGridSquare,
          toEndPosition,
          (wirePosition - 0.5) * 2
        );
      }
    };

    const isBlocked = (wire, wirePosition, items, item) => {
      for (const otherItem of items) {
        if (otherItem === item) break;

        if (wire === otherItem.wire) return true;

        if (wire.toWire === otherItem.wire) {
          const diff = Math.abs(wirePosition - (1 + otherItem.wirePosition));
          if (diff < 0.8) return true;
        }
      }
      return false;
    };

    const make = (wire, data, gridSize, items) => {
      const center = Vec2.add(
        Vec2.mulByNumber(wire.index2D, gridSize),
        Vec2.fromNumber(gridSize / 2)
      );
      if (!isBlocked(wire, 0.5, items)) {
        items.push({
          wirePosition: 0.5,
          position: center,
          wire,
          data,
          lastTransformIndex: [-1, -1]
        });
      }
    };

    const move = (item, items, grid, gridSize) => {
      const itemIndex2D = [
        Math.floor(item.position[0] / gridSize),
        Math.floor(item.position[1] / gridSize)
      ];

      const newWire = Array2D.getEntry(grid, itemIndex2D);
      if (item.wire !== newWire && newWire) {
        item.wire = newWire;
        item.wirePosition = item.wirePosition % 1;
      }
      const wire = item.wire;

      let targetPosition = _targetPosition(wire, item.wirePosition);
      if (!targetPosition) return false;

      let speed = 0.04;

      const itemIsInCenter = item.wirePosition < 0.6 && item.wirePosition > 0.4;
      if (wire.type === CircuitGrid.BOX) {
        speed = 0.02;
        if (
          itemIsInCenter &&
          !Bool.fromVec2sAreEqual(item.lastTransformIndex, wire.index2D)
        ) {
          item.lastTransformIndex = wire.index2D;
          item.data = wire.data.func(item.data, item);
        }
      }

      item.position = Vec2.lerp(item.position, targetPosition, 0.5);
      if (!isBlocked(wire, item.wirePosition, items, item)) {
        item.wirePosition += speed;
      }

      if (item.wirePosition >= 0.5) {
        if (!wire.toWire) {
          item.wirePosition = 0.499;
        }
      }

      return true;
    };

    return {
      make,
      move
    };
  }
  );
  main.variable(observer("Draw")).define("Draw", ["Vec2", "Iterable", "Direction", "Numbers", "Radians", "Color"], function (Vec2, Iterable, Direction, Numbers, Radians, Color) {
    const winCover = (width, height, context) => {
      context.fillStyle = "#48DC83";
      context.fillRect(0, 0, width, height);
      context.fillStyle = "#19753e";
      context.font = "bold 60px Source Serif Pro";
      context.fillText("You solved it!", width / 2 - 200, height / 2 - 30);
    };

    const statusText = ([x, y], text, context) => {
      context.fillStyle = "#333";
      context.font = "bold 26px Source Serif Pro";
      context.fillText(text, x, y);
    };

    const cursorGridHighlight = ([x, y], gridSize, context) => {
      context.fillStyle = "#FFD600";
      context.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
    };

    const grid = (width, height, gridSize, context) => {
      context.fillStyle = "#052440";
      for (let x = 0; x < width; x += gridSize) {
        context.fillRect(x - 2, 0, 2, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        context.fillRect(0, y - 2, width, 2);
      }
    };

    const wire = (w, gridSize, context) => {
      const center = Vec2.add(
        Vec2.mulByNumber(w.index2D, gridSize),
        Vec2.fromNumber(gridSize / 2)
      );

      const adjacentConnectionPositions = Array.from(
        Iterable.map(w.adjacentWires, (adjacentWire) => {
          const direction = Direction.betweenVec2s(
            w.index2D,
            adjacentWire.index2D
          );
          const dirVec = Vec2.unitFromDirection(direction);
          const connectionPosition = Vec2.add(
            center,
            Vec2.mulByNumber(dirVec, gridSize / 2)
          );
          return connectionPosition;
        })
      );

      context.lineWidth = 5;
      context.strokeStyle = "#EC4680";
      context.lineCap = "round";
      context.lineJoin = "round";
      context.beginPath();
      if (adjacentConnectionPositions.length === 0) {
        context.moveTo(...Vec2.add(center, [-5, 0]));
        context.lineTo(...Vec2.add(center, [5, 0]));
        context.moveTo(...Vec2.add(center, [0, -5]));
        context.lineTo(...Vec2.add(center, [0, 5]));
      } else {
        for (const position of adjacentConnectionPositions) {
          context.moveTo(...center);
          context.lineTo(...position);
        }
      }
      context.stroke();
      context.closePath();

      // Notes for bendy wires:
      // wire direction cases (11 total)
      // if (w.adjacentWires.size === 2) {
      //   - straight line (vertical or horizontal)

      //   - bend (4 corners)
      // } else if (w.adjacentWires.size === 1) {
      //   - short line (4 cardinal directions)
      // } else {
      //   - no directions
      // }

      // if (w.toWire || w.fromWire) {
      //   animate flow
      // }
    };
    const box = (w, gridSize, context) => {
      const gridInset = 10;
      const topLeft = Vec2.add(
        Vec2.mulByNumber(w.index2D, gridSize),
        Vec2.fromNumber(gridInset)
      );
      const length = gridSize - gridInset * 2;

      // BOX
      context.strokeStyle = "#EC4680";
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 9;
      context.beginPath();
      context.moveTo(...topLeft);
      context.lineTo(...Vec2.add(topLeft, [length, 0]));
      context.lineTo(...Vec2.add(topLeft, [length, length]));
      context.lineTo(...Vec2.add(topLeft, [0, length]));
      context.lineTo(...topLeft);
      context.stroke();
      context.fillStyle = "#031C32";
      context.fill();
      context.closePath();

      // TEXT
      context.fillStyle = "#EC4680";
      context.font = "30px arial";
      context.fillText(
        w.data.label,
        ...Vec2.add(topLeft, [length / 3.8, length * 0.75])
      );
    };

    const arrow = (tail, tip, color, context) => {
      context.strokeStyle = color;
      context.lineCap = "round";
      context.lineJoin = "round";
      const size = Numbers.distanceBetweenVec2s(tail, tip);
      context.lineWidth = size / 6;
      context.beginPath();
      context.moveTo(...tail);
      context.lineTo(...tip);
      const arrowHead1Angle = Radians.betweenVec2s(tip, tail) + Math.PI / 4;
      const arrowHead2Angle = Radians.betweenVec2s(tip, tail) - Math.PI / 4;
      const arrowHead1 = Vec2.add(
        tip,
        Vec2.mulByNumber(Vec2.unitFromRadians(arrowHead1Angle), size / 2)
      );
      const arrowHead2 = Vec2.add(
        tip,
        Vec2.mulByNumber(Vec2.unitFromRadians(arrowHead2Angle), size / 2)
      );
      context.lineTo(...arrowHead1);
      context.moveTo(...tip);
      context.lineTo(...arrowHead2);
      context.stroke();
      context.closePath();
    };

    const source = (w, gridSize, context) => {
      const center = Vec2.add(
        Vec2.mulByNumber(w.index2D, gridSize),
        Vec2.fromNumber(gridSize / 2)
      );
      context.fillStyle = "#EC4680";
      context.beginPath();
      context.arc(...center, gridSize / 2 - 5, 0, Math.PI * 2, true); // Outer circle
      context.fill();
      context.closePath();
      //wire(w, gridSize, context);
      arrow(
        [center[0] - 10, center[1]],
        [center[0] + 10, center[1]],
        "#031C32",
        context
      );
    };

    const ket = (position, color, context) => {
      const height = 11;
      const backWidth = 15;
      const forwardWidth = 11;

      context.strokeStyle = "#031C32";
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 9;
      context.fillStyle = "white";
      context.beginPath();
      // back line |
      context.moveTo(...Vec2.add(position, [-backWidth, height]));
      context.lineTo(...Vec2.add(position, [-backWidth, -height]));
      // front angle bracket >
      context.lineTo(...Vec2.add(position, [forwardWidth, -height]));
      context.lineTo(...Vec2.add(position, [forwardWidth + height, 0]));
      context.lineTo(...Vec2.add(position, [forwardWidth, height]));
      context.lineTo(...Vec2.add(position, [-backWidth, height]));
      context.fill();
      //context.stroke();
      context.closePath();

      context.strokeStyle = color;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 3;
      context.beginPath();
      // back line |
      context.moveTo(...Vec2.add(position, [-backWidth, height]));
      context.lineTo(...Vec2.add(position, [-backWidth, -height]));
      // front angle bracket >
      context.moveTo(...Vec2.add(position, [forwardWidth, -height]));
      context.lineTo(...Vec2.add(position, [forwardWidth + height, 0]));
      context.lineTo(...Vec2.add(position, [forwardWidth, height]));
      context.stroke();
      context.closePath();
    };
    const item = (item, context) => {
      const color = Color.interpolateHex(0xff0000, 0x0000ff, item.data[0] ** 2);
      ket(item.position, color, context);
      const flippedYData = [item.data[0], -item.data[1]]; // Flip y coordinate so up is [1,0]
      const angle = Radians.betweenVec2s([0, 0], flippedYData);
      const tail = Vec2.add(
        item.position,
        Vec2.mulByNumber(Vec2.rotateHalf(Vec2.unitFromRadians(angle)), 8)
      );
      const tip = Vec2.add(
        item.position,
        Vec2.mulByNumber(Vec2.unitFromRadians(angle), 8)
      );
      arrow(tail, tip, color, context);
    };

    return {
      winCover,
      statusText,
      cursorGridHighlight,
      grid,
      wire,
      box,
      source,
      item
    };
  }
  );
  main.variable(observer("InlineDraw")).define("InlineDraw", ["DOM", "gridSize", "Item", "Draw"], function (DOM, gridSize, Item, Draw) {
    const ket = (vec) => {
      const ketContext = DOM.context2d(gridSize - 22, gridSize - 30);
      const canvas = ketContext.canvas;

      const items = [];
      ketContext.clearRect(0, 0, gridSize - 22, gridSize - 30);
      ketContext.translate(-15, -15);
      Item.make({ index2D: [0, 0] }, vec, gridSize, items);
      Draw.item(items[0], ketContext);
      ketContext.translate(15, 15);

      return canvas;
    };
    const box = (label) => {
      const context = DOM.context2d(gridSize * 0.5, gridSize * 0.5);
      const canvas = context.canvas;
      context.scale(0.5, 0.5);
      Draw.box({ index2D: [0, 0], data: { label } }, gridSize, context);

      return canvas;
    };
    const source = () => {
      const context = DOM.context2d(gridSize * 0.5, gridSize * 0.5);
      const canvas = context.canvas;
      context.scale(0.5, 0.5);
      Draw.source({ index2D: [0, 0] }, gridSize, context);

      return canvas;
    };

    return {
      ket,
      box,
      source
    };
  }
  );
  main.variable(observer("Color")).define("Color", function () {
    const rgbToHex = ([r, g, b]) => {
      let hexColor = 0;
      return (r << 16) + (g << 8) + b;
    };

    const hexToRgb = (hexColor) => {
      hexColor >>>= 0;
      const b = hexColor & 0xff,
        g = (hexColor & 0xff00) >>> 8,
        r = (hexColor & 0xff0000) >>> 16;
      return [r, g, b];
    };

    const rgbToCSSColorString = ([r, g, b]) => `rgb(${r},${g},${b})`;

    const interpolateHex = (hexColor1, hexColor2, value = 0.5) => {
      const [r1, g1, b1] = hexToRgb(hexColor1);
      const [r2, g2, b2] = hexToRgb(hexColor2);
      return rgbToCSSColorString([
        r1 * value + r2 * (1 - value),
        g1 * value + g2 * (1 - value),
        b1 * value + b2 * (1 - value)
      ]);
    };

    return { interpolateHex };
  }
  );
  main.variable(observer("CircuitGrid")).define("CircuitGrid", ["Iterable", "Graph", "Array2D", "Direction", "Vec2"], function (Iterable, Graph, Array2D, Direction, Vec2) {
    const WIRE = Symbol("wire");
    const BOX = Symbol("Box");
    const SOURCE = Symbol("Source");

    const _propogateWireDirection = (sourceWire) => {
      for (const [wire, prevWire] of Iterable.skip(
        1,
        Iterable.withHistory(
          2,
          Graph.walk(sourceWire, (v) => v.adjacentWires)
        )
      )) {
        wire.toWire = null;
        wire.fromWire = prevWire;
        prevWire.toWire = wire;
      }
    };

    const _propogateWireNumber = (
      sourceWireFromWireNumber,
      inWire,
      wireNumber
    ) => {
      for (const wire of Graph.walk(inWire, (v) => v.adjacentWires)) {
        if (wire.type === SOURCE) {
          sourceWireFromWireNumber.delete(wire.wireNumber);
          sourceWireFromWireNumber.set(wireNumber, wire);
        }
        wire.wireNumber = wireNumber;
      }
    };

    const _removeConnect = (circuit, fromWire, toWire) => {
      if (fromWire.adjacentWires.has(toWire)) {
        fromWire.adjacentWires.delete(toWire);
        _propogateWireNumber(
          circuit.sourceWireFromWireNumber,
          fromWire,
          circuit.wireCounter++
        );

        const sourceWire = circuit.sourceWireFromWireNumber.get(
          fromWire.wireNumber
        );
        if (sourceWire) {
          _propogateWireDirection(sourceWire);
        } else {
          for (const currentWire of Graph.walk(
            fromWire,
            (v) => v.adjacentWires
          )) {
            currentWire.toWire = null;
            currentWire.fromWire = null;
          }
        }
      }
    };

    const remove = (circuit, index2D) => {
      const grid = circuit.grid;
      const wire = Array2D.getEntry(grid, index2D);
      if (wire) {
        if (wire.type === SOURCE) {
          circuit.sourceWireFromWireNumber.delete(wire.wireNumber);
        }
        Array2D.setEntry(grid, index2D, undefined);
        for (const direction of Direction.DIRECTIONS) {
          const adjacent = Array2D.getEntry(
            grid,
            Vec2.add(index2D, Vec2.fromDirection(direction))
          );

          if (adjacent) {
            _removeConnect(circuit, adjacent, wire);
          }
        }
      }
    };

    // This function just checks if the fromEntry is able to connect to the toEntry,
    // it doesn't check if the toEntry can connect to the fromEntry.
    const _canConnect = (sourceWireFromWireNumber, fromWire, toWire) => {
      if (!fromWire || !toWire) return false;
      if (fromWire.type === WIRE || fromWire.type === BOX) {
        return (
          fromWire.adjacentWires.size < 2 &&
          fromWire.wireNumber !== toWire.wireNumber &&
          !(
            sourceWireFromWireNumber.has(fromWire.wireNumber) &&
            sourceWireFromWireNumber.has(toWire.wireNumber)
          )
        );
      } else if (fromWire.type === SOURCE) {
        return (
          fromWire.adjacentWires.size < 1 &&
          !sourceWireFromWireNumber.has(toWire.wireNumber)
        );
      }
      console.warn(fromWire, toWire);
      throw "CircuitGrid _canConnect unexpected code path!";
    };

    const _tryConnect = (sourceWireFromWireNumber, wire1, wire2) => {
      if (
        _canConnect(sourceWireFromWireNumber, wire1, wire2) &&
        _canConnect(sourceWireFromWireNumber, wire2, wire1)
      ) {
        const wireNumber = Math.min(wire1.wireNumber, wire2.wireNumber);
        wire1.wireNumber = wireNumber;
        wire2.wireNumber = wireNumber;

        wire1.adjacentWires.add(wire2);
        wire2.adjacentWires.add(wire1);

        _propogateWireNumber(sourceWireFromWireNumber, wire1, wireNumber);
        _propogateWireNumber(sourceWireFromWireNumber, wire2, wireNumber);

        const sourceWire = sourceWireFromWireNumber.get(wireNumber);
        if (sourceWire) {
          _propogateWireDirection(sourceWire);
        }
        return true;
      }
      return false;
    };

    const _forceConnect = (circuit, fromWire, toWire) => {
      let relocatedWire;
      const alreadyConnected = toWire.adjacentWires.has(fromWire);
      const canForceConnect = !_canConnect(
        circuit.sourceWireFromWireNumber,
        toWire,
        fromWire
      );
      if (!alreadyConnected && canForceConnect) {
        let toAdjacentWire;
        if (
          circuit.sourceWireFromWireNumber.has(toWire.wireNumber) &&
          circuit.sourceWireFromWireNumber.has(fromWire.wireNumber) &&
          toWire.wireNumber !== fromWire.wireNumber
        ) {
          toAdjacentWire =
            toWire.fromWire || Iterable.first(toWire.adjacentWires);
        } else {
          toAdjacentWire = toWire.toWire || Iterable.first(toWire.adjacentWires);
        }

        if (toAdjacentWire) {
          relocatedWire = toAdjacentWire;
          _removeConnect(circuit, toWire, toAdjacentWire);
          _removeConnect(circuit, toAdjacentWire, toWire);
        }
      }
      _tryConnect(circuit.sourceWireFromWireNumber, fromWire, toWire);
      return relocatedWire;
    };

    const _setWire = (circuit, wire) => {
      for (const direction of Direction.DIRECTIONS) {
        const adjacentWire = Array2D.getEntry(
          circuit.grid,
          Vec2.add(wire.index2D, Vec2.fromDirection(direction))
        );
        _tryConnect(circuit.sourceWireFromWireNumber, wire, adjacentWire);
      }
    };

    const insert = (circuit, index2D, facing, type = WIRE, data) => {
      const grid = circuit.grid;
      if (Array2D.getEntry(grid, index2D)) {
        const wire = Array2D.getEntry(grid, index2D);

        const fromWire = Array2D.getEntry(
          grid,
          Vec2.add(index2D, Vec2.fromDirection(Direction.opposite(facing)))
        );
        if (fromWire) {
          const relocatedWire1 = _forceConnect(circuit, fromWire, wire);
          const relocatedWire2 = _forceConnect(circuit, wire, fromWire);

          _setWire(circuit, fromWire);
          // note: the next two lines are commented because they
          // can make relocated wires connect, which can be distracting
          // when the user didn't explicitely ask for that to happen.
          //if (relocatedWire1) _setWire(circuit, relocatedWire1);
          //if (relocatedWire2) _setWire(circuit, relocatedWire2);
        }
      } else {
        const wire = {
          type,
          index2D,
          adjacentWires: new Set(),
          toWire: null,
          fromWire: null,
          wireNumber: circuit.wireCounter++,
          time: 0,
          data
        };
        Array2D.setEntry(grid, index2D, wire);

        _setWire(circuit, wire);
      }
    };

    return {
      insert,
      remove,
      WIRE,
      BOX,
      SOURCE,
      _propogateWireNumber
    };
  }
  );
  main.variable(observer("Iterable")).define("Iterable", function () {
    const withHistory = function* (number, iterable) {
      let history = Array(number);
      for (const result of iterable) {
        history = [result, ...history];
        history.length = number;
        yield history;
      }
    };
    const range = function* (start, end, step = 1) {
      for (let n = start; n < end; n += step) {
        yield n;
      }
    };
    const take = function* (number, iterable) {
      let i = 0;
      for (const item of iterable) {
        i++;
        if (i > number) break;
        yield item;
      }
    };
    const first = (iterable) => Array.from(take(1, iterable))[0];
    const skip = function* (number, iterable) {
      let i = 0;
      for (const item of iterable) {
        i++;
        if (i <= number) continue;
        yield item;
      }
    };
    const map = function* (iterable, func) {
      for (const item of iterable) yield func(item);
    };
    const some = function (iterable, func) {
      for (const item of iterable) {
        if (func(item)) return true;
      }
      return false;
    };

    return {
      withHistory,
      range,
      take,
      first,
      skip,
      map,
      some
    };
  }
  );
  main.variable(observer("Graph")).define("Graph", function () {
    const walkDepthFirst = function* (
      inVertex,
      adjacentVerticesFromVertex = (v) => v.adjacentVertices
    ) {
      const visitedNodes = new Set([inVertex]);
      const stack = [inVertex];

      while (stack.length !== 0) {
        const currentVertex = stack.pop();
        yield currentVertex;

        for (const adjacentVertex of adjacentVerticesFromVertex(currentVertex)) {
          if (!visitedNodes.has(adjacentVertex)) {
            visitedNodes.add(adjacentVertex);
            stack.push(adjacentVertex);
          }
        }
      }
    };
    const walkBreadthFirst = function* (
      inVertex,
      adjacentVerticesFromVertex = (v) => v.adjacentVertices
    ) {
      const visitedNodes = new Set([inVertex]);
      const queue = [inVertex];

      while (queue.length !== 0) {
        const currentVertex = queue.shift();
        yield currentVertex;

        for (const adjacentVertex of adjacentVerticesFromVertex(currentVertex)) {
          if (!visitedNodes.has(adjacentVertex)) {
            visitedNodes.add(adjacentVertex);
            queue.push(adjacentVertex);
          }
        }
      }
    };

    return {
      walkDepthFirst,
      walkBreadthFirst,
      walk: walkBreadthFirst
    };
  }
  );
  main.variable(observer("Array2D")).define("Array2D", function () {
    const setEntry = (array2d, [x, y], value) => {
      let column = array2d[x];
      if (!column) {
        column = [];
        array2d[x] = column;
      }
      array2d[x][y] = value;
    };
    const getEntry = (array2d, [x, y]) => {
      if (array2d[x]) {
        return array2d[x][y];
      }
    };
    return {
      setEntry,
      getEntry
    };
  }
  );
  main.variable(observer("Vec2")).define("Vec2", ["Radians"], function (Radians) {
    const unitFromRadians = (θ) => [Math.cos(θ), -Math.sin(θ)];
    const unitFromDirection = (direction) =>
      unitFromRadians(Radians.fromDirection(direction));
    const mulByNumber = ([x, y], number) => [x * number, y * number];
    const leftMulBy4x4Matrix = ([[m1, m2], [m3, m4]], [x, y]) => [
      m1 * x + m2 * y,
      m3 * x + m4 * y
    ];
    const add = ([x1, y1], [x2, y2]) => [x1 + x2, y1 + y2];
    const subtract = ([x1, y1], [x2, y2]) => [x1 - x2, y1 - y2];
    const round = ([x, y]) => [Math.round(x), Math.round(y)];
    const fromNumber = (number) => [number, number];
    const rotateQuarter = ([x, y]) => [y, -x];
    const rotateHalf = ([x, y]) => [-x, -y];
    const rotate = (θ, [x, y]) => [
      Math.cos(θ) * x + Math.sin(θ) * y,
      -Math.sin(θ) * x + Math.cos(θ) * y
    ];
    const lerp = (v1, v2, p) => add(mulByNumber(v1, 1 - p), mulByNumber(v2, p));
    const fromIndexAndScale = (top, size) =>
      add(mulByNumber(top, size), fromNumber(size / 2));

    return {
      fromNumber,
      unitFromRadians,
      unitFromDirection,
      mulByNumber,
      rotateQuarter,
      rotateHalf,
      rotate,
      leftMulBy4x4Matrix,
      add,
      subtract,
      round,
      lerp,
      fromIndexAndScale
    };
  }
  );
  main.variable(observer("Bool")).define("Bool", function () {
    const fromVec2sAreEqual = ([x1, y1], [x2, y2]) => x1 === x2 && y1 === y2;

    return {
      fromVec2sAreEqual
    };
  }
  );
  main.variable(observer("Radians")).define("Radians", ["Numbers"], function (Numbers) {
    const betweenVec2s = ([x1, y1], [x2, y2]) =>
      Numbers.mod(Math.atan2(-(y2 - y1), x2 - x1), Math.PI * 2);
    const fromVec = ([x, y]) => Math.atan2(y, x);

    return {
      betweenVec2s,
      fromVec
    };
  }
  );
  main.variable(observer("Direction")).define("Direction", ["Numbers", "Radians", "Vec2"], function (Numbers, Radians, Vec2) {
    const UP = Symbol("UP");
    const LEFT = Symbol("LEFT");
    const DOWN = Symbol("DOWN");
    const RIGHT = Symbol("RIGHT");
    const DIRECTIONS = [RIGHT, UP, LEFT, DOWN];
    const fromRadians = (θ) =>
      DIRECTIONS[Numbers.mod(Math.round(θ / (Math.PI / 2)), 4)];
    Radians.fromDirection = (direction) =>
    ({
      [RIGHT]: 0,
      [UP]: Math.PI / 2,
      [LEFT]: Math.PI,
      [DOWN]: (Math.PI * 3) / 2
    }[direction]);
    Vec2.fromDirection = (direction) =>
    ({
      [RIGHT]: [1, 0],
      [UP]: [0, -1],
      [LEFT]: [-1, 0],
      [DOWN]: [0, 1]
    }[direction]);
    const betweenVec2s = (v1, v2) => fromRadians(Radians.betweenVec2s(v1, v2));
    const opposite = (direction) =>
      ({ [UP]: DOWN, [DOWN]: UP, [LEFT]: RIGHT, [RIGHT]: LEFT }[direction]);

    return {
      UP,
      LEFT,
      DOWN,
      RIGHT,
      DIRECTIONS,
      fromRadians,
      betweenVec2s,
      opposite
    };
  }
  );
  main.variable(observer("Numbers")).define("Numbers", function () {
    const mod = (x, n) => ((x % n) + n) % n;
    // NOT VERIFIED TO WORK:
    const subMod = (a, b, n = 1) => {
      const diff = Math.abs(b - a);
      return Math.min(diff, n - diff);
    };
    const round = (n, step = 1) => Math.round(n / step) * step;
    const distanceBetweenVec2s = ([x1, y1], [x2, y2]) =>
      Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    return {
      mod,
      subMod,
      round,
      distanceBetweenVec2s
    };
  }
  );
  main.variable(observer("InputState")).define("InputState", ["HTMLElement", "HTMLDocument"], function (HTMLElement, HTMLDocument) {
    return (
      class InputState {
        constructor(el = document.body, mobile) {
          if (!(el instanceof HTMLElement || el instanceof HTMLDocument))
            throw new TypeError(
              "ParameterError: el must be an HTMLElement or HTMLDocument!"
            );

          this._el = el;
          //allow this element to be focused
          if (el.tabIndex == -1) el.tabIndex = 1;
          //input state
          this.keysDown = {};
          this.keysPressed = {};
          this.keysReleased = {};
          this.buttonsDown = {};
          this.buttonsPressed = {};
          this.buttonsReleased = {};
          this.mouse = [0, 0];
          this.scroll = 0;

          this.frameReset();

          //mouse and keybaord
          //disable the context menu
          el.addEventListener("contextmenu", (e) => e.preventDefault());
          //add callbacks
          const mouseWheelHandler = (e) => {
            this.scroll += Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
          };
          el.addEventListener("mousewheel", mouseWheelHandler);
          el.addEventListener("DOMMouseScroll", mouseWheelHandler);
          el.addEventListener("mousedown", (e) => {
            e.preventDefault();
            el.focus();
          });
          document.body.addEventListener("mousedown", (e) => {
            //e.preventDefault();
            //el.focus();
            if (e.target !== el) return;
            this.buttonsDown[e.button] = true;
            this.buttonsPressed[e.button] = true;
          });
          document.body.addEventListener("mouseup", (e) => {
            //e.preventDefault();
            this.buttonsDown[e.button] = false;
            this.buttonsReleased[e.button] = true;
          });
          el.addEventListener("mousemove", (e) => {
            this.mouse = [e.offsetX, e.offsetY];
          });
          document.body.addEventListener("keydown", (e) => {
            if (!this.keysDown[e.key.toLowerCase()]) {
              this.keysPressed[e.key.toLowerCase()] = true;
              this.keysDown[e.key.toLowerCase()] = true;
            }

            if (e.key.toLowerCase().includes("arrow")) {
              e.preventDefault();
            }
          });
          document.body.addEventListener("keyup", (e) => {
            this.keysReleased[e.key.toLowerCase()] = true;
            this.keysDown[e.key.toLowerCase()] = false;

            if (e.key.toLowerCase().includes("arrow")) {
              e.preventDefault();
            }
          });
          el.addEventListener(
            "touchstart",
            (event) => {
              const firstTouch = event.touches[0];
              if (firstTouch) {
                this.buttonsDown[0] = true;
                this.buttonsPressed[0] = true;
              }

              event.preventDefault();
            },
            true
          );
          el.addEventListener(
            "touchmove",
            (event) => {
              const firstTouch = event.touches[0];

              if (firstTouch) {
                this.buttonsDown[0] = true;

                const { left, top } = el.getBoundingClientRect();

                this.mouse = [firstTouch.clientX - left, firstTouch.clientY - top];
              }

              event.preventDefault();
            },
            true
          );
          el.addEventListener(
            "touchend",
            (event) => {
              const firstTouch = event.touches[0];

              this.buttonsDown[0] = false;
              this.buttonsReleased[0] = true;

              event.preventDefault();
            },
            true
          );
          el.addEventListener(
            "touchcancel",
            (event) => {
              const firstTouch = event.touches[0];

              this.buttonsDown[0] = false;
              this.buttonsReleased[0] = true;

              event.preventDefault();
            },
            true
          );
        }

        setCursor(...args) {
          this._el.style.cursor = args.reduce((a, c) => a + c + ", ", "") + "auto";
        }

        isKeyDown(key) {
          return this.keysDown[key.toLowerCase()] ? true : false;
        }

        isButtonDown(button) {
          if (typeof button == "string") button = this._stringToMouseCode(button);

          return this.buttonsDown[button] ? true : false;
        }

        isKeyPressed(key) {
          return this.keysPressed[key.toLowerCase()] ? true : false;
        }

        isKeyReleased(key) {
          return this.keysReleased[key.toLowerCase()] ? true : false;
        }

        isButtonPressed(button) {
          if (typeof button == "string") button = this._stringToMouseCode(button);

          return this.buttonsPressed[button] ? true : false;
        }

        isButtonReleased(button) {
          if (typeof button == "string") button = this._stringToMouseCode(button);

          return this.buttonsReleased[button] ? true : false;
        }

        _stringToMouseCode(str) {
          switch (str.toLowerCase()) {
            case "left":
              return 0;
            case "middle":
              return 1;
            case "right":
              return 2;
            default:
              throw "invalid mouse button";
          }
        }

        frameReset() {
          this.keysPressed = {};
          this.keysReleased = {};
          this.buttonsPressed = {};
          this.buttonsReleased = {};
          this.scroll = 0;
        }
      }
    )
  });
  return main;
}
