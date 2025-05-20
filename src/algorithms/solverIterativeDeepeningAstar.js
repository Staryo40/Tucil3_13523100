const { SearchNode, PuzzleState, SearchOutput } = require('../struct/puzzlestruct.js');
const { expandNode } = require('../solver/helper.js');
const { getCostFunction, checkHorCarBlockingExit, isPrimaryOnGoal } = require('../solver/heuristic.js');

/**
 * Performs Iterative Deepening A* (IDA*) search on the given Rush Hour puzzle state.
 *
 * IDA* combines the space efficiency of Depth-First Search with the optimality of A*.
 * It uses a threshold-based iterative deepening strategy, gradually increasing the allowed
 * estimated cost `f(n) = g(n) + h(n)` until the goal is found or no solution exists.
 *
 * @param {PuzzleState} initState - The starting state of the puzzle.
 * @param {(state: PuzzleState) => number} heuristicFn - Heuristic function estimating cost to goal.
 * @returns {SearchOutput} An object containing:
 *   - {SearchNode|null} node: The goal node if found, or null if no solution.
 *   - {number} totalMove: Total unique states expanded during the search.
 */
function iterativeDeepeningAstar(initState, heuristicFn) {
    if (checkHorCarBlockingExit(initState)){
        return new SearchOutput(null, 0);
    }

    const startNode = new SearchNode(initState, 0, null, 0);
    const costFn = getCostFunction("AStar", heuristicFn);
    let threshold = costFn(startNode);
    
    
    const globalVisited = new Set();
    let totalMove = { count: 0 };

    while (true) {
        const visited = new Set();
        const result = dfsBounded(startNode, threshold, costFn, visited, globalVisited, totalMove);

        // console.log(`IDA* iteration: threshold=${threshold}, totalVisited=${totalMove.count}, nextThreshold=${result.nextThreshold}`);

        if (result.found) {
            return new SearchOutput(result.node, totalMove.count);
        }

        if (result.nextThreshold === Infinity) {
            return new SearchOutput(null, totalMove.count);
        }

        threshold = result.nextThreshold;
    }
}

/**
 * Performs a depth-first search bounded by a given threshold of estimated cost `f(n)`.
 * This function is a core part of IDA*, used to explore nodes within the current cost limit.
 *
 * @param {SearchNode} node - The current node being explored.
 * @param {number} threshold - The maximum allowable estimated cost for this DFS pass.
 * @param {(node: SearchNode) => number} costFn - Function to compute `f(n)` for a node.
 * @param {Set<string>} visited - Local set of visited board states for the current DFS branch.
 * @param {Set<string>} globalVisited - Global set of all visited states across iterations.
 * @param {number} totalMove - Accumulated count of unique nodes visited.
 * @returns {{
 *   found: boolean,
 *   node?: SearchNode,
 *   nextThreshold: number,
 *   totalMove: number
 * }} Result of the bounded search attempt.
 */
function dfsBounded(node, threshold, costFn, visited, globalVisited, totalMove) {
    const f = costFn(node);
    if (f > threshold) { // Pruning paths that are above the threshold
        return { found: false, nextThreshold: f, totalMove };
    }

    const key = node.state.board;

    if (visited.has(key)) {
        // if (totalMove.count % 100 === 0) {
        //     console.log(`⏪ Revisited state at f=${f}, g=${node.g}`);
        // }
        return { found: false, nextThreshold: Infinity };
    }

    visited.add(key);

    if (!globalVisited.has(key)) {
        globalVisited.add(key);
        totalMove.count++;
    }

    if (isPrimaryOnGoal(node.state)) { // Solution found
        return { found: true, node };
    }

    let minOver = Infinity;
    const children = expandNode(node, costFn);

    for (const child of children) { // DFS bounded search
        const result = dfsBounded(child, threshold, costFn, visited, globalVisited, totalMove);

        if (result.found) return result; 
        minOver = Math.min(minOver, result.nextThreshold);
    }

    // visited.delete(key);
    return { found: false, nextThreshold: minOver, totalMove };
}

module.exports = {
    iterativeDeepeningAstar
}