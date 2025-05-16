const { CarInfo, PuzzleState } = require('../struct/puzzlestruct.js');
const { InputStruct } = require('../struct/inputstruct.js');

/**
 * Converts an InputStruct to a PuzzleState by extracting car metadata from the board.
 * This function analyzes the board, determines each car's orientation, length,
 * and top-left position, then constructs a PuzzleState with a complete car map.
 *
 * @param {InputStruct} input - The validated input structure representing the initial puzzle.
 * @returns {PuzzleState} The converted puzzle state ready for solving.
 */
function inputToPuzzleState(input) {
  const { row, col, state: board2D, goalPos } = input;
  const cars = new Map();
  const visited = new Set();

  // Convert 2D board array to flat string
  const flatBoard = board2D.flat().join('');

  for (let r = 0; r < row; r++) {
    for (let c = 0; c < col; c++) {
      const idx = r * col + c;
      const ch = flatBoard[idx];

      if (ch === '.' || ch === '*' || ch === 'K' || visited.has(ch)) continue;

      let orientation = null;
      let length = 1;

      if (c + 1 < col && flatBoard[idx + 1] === ch) {
        orientation = '-';
        length = 2;
        if (c + 2 < col && flatBoard[idx + 2] === ch) {
          length = 3;
        }
      } else if (r + 1 < row && flatBoard[idx + col] === ch) {
        orientation = '|';
        length = 2;
        if (r + 2 < row && flatBoard[idx + 2 * col] === ch) {
          length = 3;
        }
      }

      if (orientation) {
        cars.set(ch, new CarInfo(orientation, length, [r, c]));
        visited.add(ch);
      }
    }
  }

  return new PuzzleState(row, col, flatBoard, goalPos, cars);
}

module.exports = {
    inputToPuzzleState
}