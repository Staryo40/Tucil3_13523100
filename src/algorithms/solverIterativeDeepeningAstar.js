const { SearchNode, PuzzleState, SearchOutput } = require('../struct/puzzlestruct.js');
const { expandNode } = require('../solver/helper.js');
const { getCostFunction, checkHorCarBlockingExit, isPrimaryOnGoal } = require('../solver/heuristic.js');

function iterativeDeepeningAstar(initState, heuristicFn) {
    if (checkHorCarBlockingExit(initState)){
        return new SearchOutput(null, 0);
    }

    const startNode = new SearchNode(initState, 0, null, 0);
    const costFn = getCostFunction("AStar", heuristicFn);
    let threshold = costFn(startNode);

    const globalVisited = new Set();
    let totalMove = 0;

    while (true) {
        const visited = new Set();
        const result = dfsBounded(startNode, threshold, costFn, visited, globalVisited, totalMove);

        if (result.found) {
            return new SearchOutput(result.node, result.totalMove);
        }

        if (result.nextThreshold === Infinity) {
            return new SearchOutput(null, result.totalMove);
        }

        totalMove = result.totalMove;
        threshold = result.nextThreshold;
    }
}

function dfsBounded(node, threshold, costFn, visited, globalVisited, totalMove) {
    const f = costFn(node);
    if (f > threshold) { // Pruning paths that are above the threshold
        return { found: false, nextThreshold: f, totalMove };
    }

    const key = node.state.board;

    if (visited.has(key)) {
        return { found: false, nextThreshold: Infinity, totalMove };
    }

    visited.add(key);

    if (!globalVisited.has(key)) {
        globalVisited.add(key);
        totalMove++;
    }

    if (isPrimaryOnGoal(node.state)) { // Solution found
        return { found: true, node, totalMove };
    }

    let minOver = Infinity;
    const children = expandNode(node, costFn);

    for (const child of children) { // DFS bounded search
        const result = dfsBounded(child, threshold, costFn, visited, globalVisited, totalMove);

        if (result.found) return result; 
        minOver = Math.min(minOver, result.nextThreshold);
        totalMove = result.totalMove;
    }

    visited.delete(key);
    return { found: false, nextThreshold: minOver, totalMove };
}

module.exports = {
    iterativeDeepeningAstar
}