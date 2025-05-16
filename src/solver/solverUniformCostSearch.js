const { CarInfo, SearchNode, PuzzleState } = require('../struct/puzzlestruct.js');
const { expandNode } = require('./helper.js');
const { getCostFunction, checkHorCarBlockingExit, isPrimaryOnGoal } = require('./heuristic.js');

/**
 * Performs Uniform Cost Search (UCS) on a given Rush Hour puzzle.
 * UCS always expands the node with the lowest cost (g(n)) from the start.
 * It stops as soon as the primary car reaches the goal position.
 *
 * @param {PuzzleState} initState - The initial puzzle state to solve.
 * @returns {SearchNode|null} The goal node if a solution is found, otherwise null.
 */
function uniformCostSearch(initState) {
    const startNode = new SearchNode(initState, 0, null, 0);
    const queue = [startNode];
    const visited = new Set();

    while (queue.length > 0) {
        // Sort queue by cost (g(n))
        queue.sort((a, b) => a.g - b.g);
        const current = queue.shift();

        const stateKey = current.state.board;
        if (visited.has(stateKey)) continue;
        visited.add(stateKey);

        if (isPrimaryOnGoal(current.state)) {
            return current; // Goal reached
        }

        const neighbors = expand(current); // ← You'll need to implement this

        for (const neighbor of neighbors) {
            if (!visited.has(neighbor.state.board)) {
                queue.push(neighbor);
            }
        }
    }

    return null; // No solution found
}