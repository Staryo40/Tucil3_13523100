const { CarInfo, PuzzleState } = require('../struct/puzzlestruct.js');

/**
 * Returns a cost evaluation function for a given search strategy.
 * Will return 0 immediately if the primary car is on the goal
 *
 * - "UCS"     → cost = g(n)         (actual cost so far)
 * - "Greedy"  → cost = h(n)         (heuristic estimate to goal)
 * - "AStar"   → cost = g(n) + h(n)  (combined path and heuristic cost)
 *
 * The returned function takes a SearchNode object and returns a numeric score.
 *
 * @param {string} strategy - The search strategy ("UCS", "Greedy", or "AStar").
 * @param {(state: PuzzleState) => number} heuristicFn - A heuristic function that estimates cost from a PuzzleState to the goal.
 * @returns {(node: SearchNode) => number} A cost evaluation function for the specified strategy.
 */
function getCostFunction(strategy, heuristicFn) {
  return node => {
    if (isPrimaryOnGoal(node.state)) return 0; 

    const h = heuristicFn(node.state);
    if (strategy === "UCS") return node.g;
    if (strategy === "Greedy") return h;
    if (strategy === "AStar") return node.g + h;
  };
}
/**
 * Estimates the number of blocking tiles between the primary car ('P') and the goal.
 * This heuristic counts how many occupied cells (excluding 'P' and '.') are directly
 * between the primary car and the goal, in the direction the car needs to move.
 *
 * Assumes that the primary car is aligned with the goal either horizontally or vertically.
 * Does not check whether blockers are movable.
 *
 * @param {PuzzleState} state - The current puzzle state.
 * @returns {number} The number of blocking cells between 'P' and the goal.
 */
function heuristicBlockerCount(state){
    const primaryCar = state.cars['P']

    let blockerCount = 0;
    if (state.goalPos[0] == 0 || state.goalPos[0] == state.row-1){ // the goal is vertical
        const col = state.goalPos[1];
        if (state.goalPos[0] == 0){ // goal is at top
            for (i = 0; i < primaryCar.position[0]; i++){
                const cell = state.at(i, col);
                if (cell !== '.' && cell !== 'P') blockerCount++;
            }
        } else { // goal is at bottom
            const lowestPos = primaryCar.position[0] + primaryCar.length
            for (i = lowestPos; i < state.row; i++){
                const cell = state.at(i, col);
                if (cell !== '.' && cell !== 'P') blockerCount++;
            }
        }
    } else { // the goal is horizontal
        const row = state.goalPos[0];
        if (state.goalPos[1] == 0 || state.goalPos[1] == state.col-1){ // goal is to the left
            for (i = 0; i < primaryCar.position[1]; i++){
                const cell = state.at(row, i);
                if (cell !== '.' && cell !== 'P') blockerCount++;
            }
        } else { // goal is to the right
            const rigthPos = primaryCar.position[1] + primaryCar.length
            for (i = rigthPos; i < state.col; i++){
                const cell = state.at(row, i);
                if (cell !== '.' && cell !== 'P') blockerCount++;
            }
        }
    }

    return blockerCount;
}

/**
 * Estimates the number of cars that are blocking the primary car ('P') from reaching the goal,
 * but only counts those that can potentially be moved out of the way (i.e., there is space
 * in their legal movement direction to fully clear the blocking cell).
 *
 * This heuristic is more accurate than simple blocker count, but still admissible.
 *
 * @param {PuzzleState} state - The current puzzle state.
 * @returns {number} The estimated number of cars that can be moved to clear the path.
 */
function heuristicDistanceToFreedom(state) {
    const goal = state.goalPos;
    const primary = state.cars['P'];
    const [pr, pc] = primary.position;
    let total = 0;

    const isSameRow = pr === goal[0];
    const isSameCol = pc === goal[1];

    if (!isSameRow && !isSameCol) return Infinity;

    if (isSameRow) {
        const pEndCol = pc + primary.length;
        const start = Math.min(pEndCol, goal[1]);
        const end = Math.max(pEndCol, goal[1]);

        for (let c = start; c <= end; c++) {
            const ch = state.at(pr, c);
            if (ch !== '.' && ch !== 'P') {
                const cost = freedomDepth(state, ch);
                if (cost === Infinity) return Infinity;
                total += cost;
            }
        }
    } else {
        const pEndRow = pr + primary.length;
        const start = Math.min(pEndRow, goal[0]);
        const end = Math.max(pEndRow, goal[0]);

        for (let r = start; r <= end; r++) {
            const ch = state.at(r, pc);
            if (ch !== '.' && ch !== 'P') {
                const cost = freedomDepth(state, ch);
                if (cost === Infinity) return Infinity;
                total += cost;
            }
        }
    }

    return total;
}

/**
 * Recursively estimates the minimum number of cars that need to be moved
 * in order to allow the given blocking car to clear a path for the primary car ('P').
 * 
 * If the car can move directly into a free space, the cost is 1.
 * If the car is blocked, the function recursively checks whether the blocking
 * car(s) can be moved, accumulating the minimal number of steps needed.
 * 
 * If no resolution path is possible (stuck in a dependency loop), returns Infinity.
 * 
 * @param {PuzzleState} state - The current puzzle state.
 * @param {string} carId - The character ID of the blocking car to analyze.
 * @param {Set<string>} [visited=new Set()] - A set to prevent cycles in recursive checking.
 * @returns {number} The estimated number of moves required to clear this car, or Infinity if it’s blocked.
 */
function freedomDepth(state, carId, visited = new Set()) {
    if (visited.has(carId)) return Infinity;
    visited.add(carId);

    const car = state.cars[carId];
    const [r, c] = car.position;

    // Check each direction depending on orientation
    if (car.orientation === '|') {
        // Try moving up
        if (r > 0) {
            const above = state.at(r - 1, c);
            if (above === '.') return 1;
            if (above !== carId) {
                const d = freedomDepth(state, above, new Set(visited));
                if (d !== Infinity) return 1 + d;
            }
        }
        // Try moving down
        if (r + car.length < state.row) {
            const below = state.at(r + car.length, c);
            if (below === '.') return 1;
            if (below !== carId) {
                const d = freedomDepth(state, below, new Set(visited));
                if (d !== Infinity) return 1 + d;
            }
        }
    } else {
        // Try moving left
        if (c > 0) {
            const left = state.at(r, c - 1);
            if (left === '.') return 1;
            if (left !== carId) {
                const d = freedomDepth(state, left, new Set(visited));
                if (d !== Infinity) return 1 + d;
            }
        }
        // Try moving right
        if (c + car.length < state.col) {
            const right = state.at(r, c + car.length);
            if (right === '.') return 1;
            if (right !== carId) {
                const d = freedomDepth(state, right, new Set(visited));
                if (d !== Infinity) return 1 + d;
            }
        }
    }

    return Infinity; // no way to move
}

/**
 * Checks whether there is an unmovable horizontal car blocking the primary car ('P')
 * from reaching the goal position. Applies when 'P' and the goal are aligned either
 * horizontally (same row) or vertically (same column).
 *
 * A horizontal car is considered a blocker if it occupies any cell between 'P' and the goal
 * and its orientation is '-', meaning it cannot move vertically out of the way.
 *
 * @param {PuzzleState} state - The current puzzle state.
 * @returns {boolean} True if a horizontal car blocks the goal, false otherwise.
 */
function checkHorCarBlockingExit(state) {
    const goal = state.goalPos;
    const primary = state.cars['P'];
    const [pr, pc] = primary.position;

    const isSameRow = pr === goal[0];
    const isSameCol = pc === goal[1];

    if (!isSameRow && !isSameCol) return false; // Not aligned

    if (isSameRow) {
        const pEndCol = pc + primary.length;
        const start = Math.min(pEndCol, goal[1]);
        const end = Math.max(pEndCol, goal[1]);
        for (let c = start; c <= end; c++) {
            const ch = state.at(pr, c);
            if (ch !== '.' && ch !== 'P') {
                const car = state.cars[ch];
                if (car.orientation === '-') return true;
            }
        }
    } else if (isSameCol) {
        const pEndRow = pr + primary.length;
        const start = Math.min(pEndRow, goal[0]);
        const end = Math.max(pEndRow, goal[0]);
        for (let r = start; r <= end; r++) {
            const ch = state.at(r, pc);
            if (ch !== '.' && ch !== 'P') {
                const car = state.cars[ch];
                if (car.orientation === '-') return true;
            }
        }
    }

    return false;
}

/**
 * Checks if the primary car ('P') currently occupies the goal position.
 * This indicates that the puzzle has been solved in this state.
 *
 * @param {PuzzleState} state - The current puzzle state.
 * @returns {boolean} True if the goal position contains 'P', false otherwise.
 */
function isPrimaryOnGoal(state) {
  const [gr, gc] = state.goalPos;
  return state.at(gr, gc) === 'P';
}

module.exports = {
  getCostFunction,
  heuristicBlockerCount,
  heuristicDistanceToFreedom,
  checkHorCarBlockingExit,
  isPrimaryOnGoal
};
