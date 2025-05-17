const { SearchNode, PuzzleState } = require('../struct/puzzlestruct.js');
const { expandNode } = require('../solver/helper.js');
const { getCostFunction, checkHorCarBlockingExit, isPrimaryOnGoal } = require('../solver/heuristic.js');
const PriorityQueue = require('js-priority-queue');

/**
 * Performs Uniform Cost Search (UCS) on a given Rush Hour puzzle.
 * UCS always expands the node with the lowest cost (g(n)) from the start.
 * It stops as soon as the primary car reaches the goal position.
 *
 * @param {PuzzleState} initState - The initial puzzle state to solve.
 * @returns {SearchNode|null} The goal node if a solution is found, otherwise null.
 */
function uniformCostSearch(initState) {
    if (checkHorCarBlockingExit(initState)){
        return null
    }

    const startNode = new SearchNode(initState, 0, null, 0);
    const queue = new PriorityQueue({ comparator: (a, b) => a.cost - b.cost });
    queue.queue(startNode);
    const visited = new Set();
    const costFn = getCostFunction("UCS", () => 0);

    while (queue.length > 0) {
        const current = queue.dequeue(); 

        const stateKey = current.state.board;
        if (visited.has(stateKey)) continue;
        visited.add(stateKey);

        if (isPrimaryOnGoal(current.state)) {
            return current; 
        }

        const neighbors = expandNode(current, costFn); 

        for (const neighbor of neighbors) {
            if (!visited.has(neighbor.state.board)) {
                queue.queue(neighbor);
            }
        }
    }

    return null; // No solution found
}

module.exports = {
    uniformCostSearch
}