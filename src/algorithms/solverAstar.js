const { SearchNode, PuzzleState, SearchNodePriorityQueue, SearchOutput } = require('../struct/puzzlestruct.js');
const { expandNode } = require('../solver/helper.js');
const { getCostFunction, checkHorCarBlockingExit, isPrimaryOnGoal } = require('../solver/heuristic.js');

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