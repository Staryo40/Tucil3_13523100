const { CarInfo, SearchNode, PuzzleState } = require('../struct/puzzlestruct.js');

/**
 * Expands a search node into possible child nodes by generating valid next puzzle states
 * and wrapping them into new SearchNode instances with computed cost.
 *
 * @param {SearchNode} node - The current search node to expand.
 * @param {(node: SearchNode) => number} costFn - The strategy-specific cost function
 * @returns {SearchNode[]} An array of SearchNode instances representing valid next moves.
 */
function expandNode(node, costFn) {
    const children = [];

    const currentState = node.state;
    const gNext = node.g + 1;

    const nextStates = generateNextStates(currentState); 

    for (const newState of nextStates) {
        const tempNode = new SearchNode(newState, 0, node, gNext);
        tempNode.cost = costFn(tempNode); 
        children.push(tempNode);
    }

    return children;
}

/**
 * Generates all valid next PuzzleState instances by moving each car in all possible directions.
 * Each car may move multiple steps in its allowed orientation if space permits.
 *
 * @param {PuzzleState} state - The current puzzle state.
 * @returns {PuzzleState[]} An array of new PuzzleState objects representing valid moves.
 */
function generateNextStates(state) {
  const nextStates = [];

  for (const [carId, car] of state.cars.entries()) {
    const { orientation, length, position } = car;
    const [r, c] = position;

    const directions = orientation === '-' 
      ? [[0, -1], [0, 1]] // left and right
      : [[-1, 0], [1, 0]]; // up and down

    for (const [dr, dc] of directions) {
      // Move 1 step at a time in directions
      let step = 1;
      while (true) {
        if (!canMove(state, car, dr, dc, step)) break;

        const newState = moveCar(state, carId, dr, dc, step);
        nextStates.push(newState);
        step++;
      }
    }
  }

  return nextStates;
}

/**
 * Checks if a given car can move a certain number of steps in the specified direction
 * without going out of bounds or hitting another car.
 *
 * @param {PuzzleState} state - The current puzzle state.
 * @param {CarInfo} car - The car to check for movement.
 * @param {number} dr - Row direction delta (-1, 0, or 1).
 * @param {number} dc - Column direction delta (-1, 0, or 1).
 * @param {number} step - Number of steps to try to move the car.
 * @returns {boolean} True if the move is valid, false otherwise.
 */
function canMove(state, car, dr, dc, step) {
  const [r, c] = car.position;
  const { length } = car;

  for (let i = 0; i < step; i++) {
    const checkR = dr === 0 ? r : (dr === 1 ? r + length + i : r - 1 - i);
    const checkC = dc === 0 ? c : (dc === 1 ? c + length + i : c - 1 - i);

    if (checkR < 0 || checkR >= state.row || checkC < 0 || checkC >= state.col) return false;
    if (state.at(checkR, checkC) !== '.') return false;
  }

  return true;
}

/**
 * Returns a new PuzzleState resulting from moving the specified car a number of steps
 * in the given direction. It performs a deep copy of the board and updates the car's position.
 *
 * @param {PuzzleState} state - The current puzzle state.
 * @param {string} carId - The character ID of the car to move.
 * @param {number} dr - Row direction delta (-1, 0, or 1).
 * @param {number} dc - Column direction delta (-1, 0, or 1).
 * @param {number} step - Number of steps to move the car.
 * @returns {PuzzleState} A new PuzzleState with the car moved accordingly.
 */
function moveCar(state, carId, dr, dc, step) {
  const { row, col, board, goalPos, cars } = state;
  const car = cars.get(carId);
  const { orientation, length, position } = car;
  const [r, c] = position;

  const newBoard = board.split('');
  const newCars = new Map(cars); // shallow clone
  const [newR, newC] = [r + dr * step, c + dc * step];

  // Remove old car
  for (let i = 0; i < length; i++) {
    const clearR = r + (orientation === '|' ? i : 0);
    const clearC = c + (orientation === '-' ? i : 0);
    newBoard[clearR * col + clearC] = '.';
  }

  // Add new car
  for (let i = 0; i < length; i++) {
    const placeR = newR + (orientation === '|' ? i : 0);
    const placeC = newC + (orientation === '-' ? i : 0);
    newBoard[placeR * col + placeC] = carId;
  }

  // Update car info
  const updatedCar = new CarInfo(orientation, length, [newR, newC]);
  newCars.set(carId, updatedCar);

  return new PuzzleState(row, col, newBoard.join(''), goalPos, newCars);
}

module.exports = {
    generateNextStates,
    expandNode
}