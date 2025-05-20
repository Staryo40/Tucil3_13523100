const { SearchNode, PuzzleState, SearchNodePriorityQueue, SearchOutput } = require('../struct/puzzlestruct.js');
const { expandNode } = require('../solver/helper.js');
const { getCostFunction, checkHorCarBlockingExit, isPrimaryOnGoal } = require('../solver/heuristic.js');

/**
 * Performs Greedy Best-First Search on the given Rush Hour puzzle state.
 *
 * Greedy Best-First Search uses only the heuristic estimate `h(n)` to choose the next node
 * to explore, prioritizing nodes that appear closest to the goal. It does not guarantee the
 * shortest path but can be faster than A* in practice.
 *
 * @param {PuzzleState} initState - The initial puzzle state representing the board configuration.
 * @param {(state: PuzzleState) => number} heuristicFn - A heuristic function that estimates
 *        the cost from the current state to the goal.
 * @returns {SearchOutput} An object containing:
 *   - {SearchNode|null} node: The goal node if a solution is found, otherwise `null`.
 *   - {number} totalMove: The number of unique states expanded during the search.
 */
function greedyBestFirstSearch(initState, heuristicFn){
    if (checkHorCarBlockingExit(initState)){
        return new SearchOutput(null, 0);
    }
    const startNode = new SearchNode(initState, 0, null, 0);
    const queue = new SearchNodePriorityQueue();
    queue.enqueue(startNode);
    const visited = new Set();
    const costFn = getCostFunction("Greedy", heuristicFn);
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
    greedyBestFirstSearch
}