const { SearchNode, PuzzleState, SearchNodePriorityQueue, SearchOutput } = require('../struct/puzzlestruct.js');
const { expandNode } = require('../solver/helper.js');
const { getCostFunction, checkHorCarBlockingExit, isPrimaryOnGoal } = require('../solver/heuristic.js');

/**
 * Performs A* Search on the given Rush Hour puzzle state.
 *
 * A* is a best-first search algorithm that uses both the path cost `g(n)` and a heuristic
 * estimate `h(n)` to prioritize nodes. It finds the shortest solution path while guiding
 * the search more efficiently than UCS.
 *
 * @param {PuzzleState} initState - The initial state of the Rush Hour puzzle.
 * @param {(state: PuzzleState) => number} heuristicFn - A heuristic function that estimates
 *        the cost from the given state to the goal.
 * @returns {SearchOutput} An object containing:
 *   - {SearchNode|null} node: The final goal node if a solution is found, otherwise `null`.
 *   - {number} totalMove: The total number of unique nodes expanded during the search.
 */
function algoAStar(initState, heuristicFn){
    if (checkHorCarBlockingExit(initState)){
        return new SearchOutput(null, 0);
    }
    const startNode = new SearchNode(initState, 0, null, 0);
    const queue = new SearchNodePriorityQueue();
    queue.enqueue(startNode);
    const visited = new Set();
    const costFn = getCostFunction("AStar", heuristicFn);
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
        // current.state.print()
        // console.log(`Above g: ${current.g}`)
        // console.log(`Above cost: ${current.cost}`)

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
    algoAStar
}