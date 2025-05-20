const { SearchNode, PuzzleState, SearchNodePriorityQueue, SearchOutput } = require('../struct/puzzlestruct.js');
const { expandNode } = require('../solver/helper.js');
const { getCostFunction, checkHorCarBlockingExit, isPrimaryOnGoal } = require('../solver/heuristic.js');

/**
 * Performs Uniform Cost Search (UCS) on the given Rush Hour puzzle state.
 *
 * UCS is a search algorithm that expands the node with the lowest total cost `g(n)`,
 * ensuring the shortest-path solution is found. It terminates when the primary car
 * reaches the goal position.
 *
 * @param {PuzzleState} initState - The initial puzzle state representing the board configuration.
 * @returns {SearchOutput} An object containing:
 *   - {PuzzleNode} node: The goal node representing the final state in the solution path.
 *   - {number} totalMove: The number of unique nodes expanded during the search process.
 *   If no solution is found, `node` may be `null`.
 */
function uniformCostSearch(initState) {
    if (checkHorCarBlockingExit(initState)){
        return new SearchOutput(null, 0);
    }

    const startNode = new SearchNode(initState, 0, null, 0);
    const queue = new SearchNodePriorityQueue();
    queue.enqueue(startNode);
    const visited = new Set();
    const costFn = getCostFunction("UCS", () => 0);
    let totalMove = 0;

    while (queue.length > 0) {
        const current = queue.dequeue(); 

        const stateKey = current.state.board;
        if (visited.has(stateKey)) continue;
        visited.add(stateKey);

        if (isPrimaryOnGoal(current.state)) {
            return new SearchOutput(current, totalMove); 
        }
        totalMove++

        const neighbors = expandNode(current, costFn); 

        for (const neighbor of neighbors) {
            if (!visited.has(neighbor.state.board)) {
                queue.enqueue(neighbor);
            }
        }
    }

    return new SearchOutput(null, totalMove); // No solution found
}

module.exports = {
    uniformCostSearch
}