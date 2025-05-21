const { OutputStruct, OutputState } = require("../struct/outputstruct");
const fs = require('fs');

/**
 * Writes the OutputStruct data to a file at filePath in a formatted manner.
 * @param {OutputStruct} output 
 * @param {string} filePath 
 */
function outputToFile(output, filePath) {
    let lines = [];

    // Header Information
    lines.push(`Execution time: ${output.time} ms`);
    lines.push(`Total nodes visited: ${output.totalMove}`);
    lines.push(`Result: ${output.mainMessage}`);

    if (output.mainMessage === "Solution found") {
        lines.push(`Total moves: ${output.moveCount}`);
    }

    // Blank line after result section
    lines.push('');

    // State output
    if (!output.states){
        lines.push(`No valid solution`)
    } else {
        let i = 0
        for (const stateObj of output.states) {
            lines.push(`Step ${i}`)
            lines.push(`Message: ${stateObj.message}`);
            lines.push(formatBoard(stateObj.state));
            lines.push('');
            i++;
        }
    }

    // Write to file
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
}

/**
 * Formats a PuzzleState object into a string representing the board in rows.
 * @param {PuzzleState} puzzleState 
 * @returns {string}
 */
function formatBoard(puzzleState) {
    const { row, col, board } = puzzleState;
    let output = '';
    for (let r = 0; r < row; r++) {
        let line = '';
        for (let c = 0; c < col; c++) {
            line += board[puzzleState.rc2i(r, c)];
        }
        output += line + '\n';
    }
    return output.trimEnd(); // Remove trailing newline
}

/**
 * Constructs the final output of the solver, including execution time, move count,
 * node visit count, and a list of OutputState objects representing each move.
 *
 * @param {number} time - The total execution time in milliseconds.
 * @param {number} totalMove - The number of unique nodes visited during the search.
 * @param {SearchNode|null} lastNode - The goal node containing the final solution path,
 *        or null if no solution was found.
 * @returns {OutputStruct} An object containing summary statistics and step-by-step output states.
 */
function outputCreation(time, totalMove, lastNode){
    let moveCount = 0
    if (lastNode != null){
        moveCount = countNodes(lastNode)
    }
    if (lastNode == null){
        return new OutputStruct(time, totalMove, moveCount, null, "Solution not found")
    }  

    listNode = []
    let current = lastNode;

    while (current !== null) {
        listNode.unshift(current);
        current = current.parent;
    }

    outputStates = generateOutputStates(listNode)   

    return new OutputStruct(time, totalMove, moveCount, outputStates, "Solution found");
}

/**
 * Generates a list of OutputState objects that describe each step from start to goal.
 *
 * Each OutputState includes a human-readable message describing the move and
 * the corresponding PuzzleState.
 *
 * @param {SearchNode[]} listNode - Ordered list of nodes representing the solution path from start to goal.
 * @returns {OutputState[]} A list of OutputState instances with move descriptions.
 */
function generateOutputStates(listNode) {
    const outputStates = [];

    for (let i = 0; i < listNode.length; i++) {
        const state = listNode[i].state;

        let message;
        if (i === 0) {
            message = "Start of puzzle";
        } else if (i === listNode.length - 1) {
            message = getMoveDescription(listNode[i - 1].state, listNode[i].state) + ". Target car reached goal";
        } else {
            message = getMoveDescription(listNode[i - 1].state, listNode[i].state);
        }

        outputStates.push(new OutputState(message, state));
    }

    return outputStates;
}

/**
 * Generates a human-readable description of the move made between two puzzle states.
 *
 * Compares the position of each car in the previous and next state, and identifies
 * which car moved, in what direction, and by how many cells.
 *
 * @param {PuzzleState} prevState - The previous puzzle state.
 * @param {PuzzleState} nextState - The next puzzle state.
 * @returns {string} A move description, e.g., "Car B moved 2 cells to the right".
 */
function getMoveDescription(prevState, nextState) {
    for (const [carId, carPrev] of prevState.cars.entries()) {
        const carNext = nextState.cars.get(carId);
        if (!carNext) continue;

        const [r1, c1] = carPrev.position;
        const [r2, c2] = carNext.position;

        const deltaR = r2 - r1;
        const deltaC = c2 - c1;

        const steps = Math.abs(deltaR + deltaC);

        if (steps > 0) {
            const direction =
                carPrev.orientation === '-' ? (deltaC > 0 ? "right" : "left") :
                carPrev.orientation === '|' ? (deltaR > 0 ? "down" : "up") : "moved";

            if (carPrev.orientation === '|'){
                return `Car ${carId} moved ${steps} cell${steps > 1 ? 's' : ''} ${direction}`;
            }
            return `Car ${carId} moved ${steps} cell${steps > 1 ? 's' : ''} to the ${direction}`;
        }
    }

    return "Unknown move";
}

/**
 * Counts the number of steps (nodes) in the solution path from the initial state to the given node.
 *
 * This function walks backward from the final node to the root node by following parent links.
 *
 * @param {SearchNode|null} lastNode - The final node in the solution path.
 * @returns {number} The number of steps taken (excluding the initial state).
 */
function countNodes(lastNode){
    let count = 0;
    tempNode = lastNode;
    while (tempNode.parent != null){
        count++
        tempNode = tempNode.parent;
    }

    return count;
}

module.exports = {
    outputCreation,
    outputToFile
}