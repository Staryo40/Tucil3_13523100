const { SearchNode, PuzzleState } = require('../struct/puzzlestruct.js');
const { expandNode } = require('../solver/helper.js');
const { getCostFunction, checkHorCarBlockingExit, isPrimaryOnGoal } = require('../solver/heuristic.js');
const PriorityQueue = require('js-priority-queue');

function algoAStar(initState, heuristicFn){
    if (checkHorCarBlockingExit(initState)){
        return null
    }

    const startNode = new SearchNode(initState, 0, null, 0);
    const queue = new PriorityQueue({ comparator: (a, b) => a.cost - b.cost });
    queue.queue(startNode);
    const visited = new Set();
    const costFn = getCostFunction("AStar", heuristicFn);

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
    algoAStar
}