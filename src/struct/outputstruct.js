const { PuzzleState } = require("./puzzlestruct");

class OutputState{
      /**
     * @param {string} message - A message describing this state
     * @param {PuzzleState} state - The board state object
     */
    constructor(message, state){
        this.message = message;
        this.state = state;
    }

    print() {
        console.log(`Message: ${this.message}`);
        if (this.state && typeof this.state.print === 'function') {
            this.state.print();
        }
    }
}

class OutputStruct{
     /**
     * @param {number} time - Time taken to solve the puzzle (in milliseconds or custom unit).
     * @param {number} totalMove - Total number of node expansions or visited states.
     * @param {number} moveCount - Number of moves in the final solution path.
     * @param {OutputState[]} states - List of states traversed (each with message and board state).
     * @param {string} [mainMessage=""] - Optional summary or result message.
     */
    constructor(time, totalMove, moveCount, states, mainMessage = ""){
        this.time = time;
        this.totalMove = totalMove;
        this.moveCount = moveCount;
        this.states = states;
        this.mainMessage = mainMessage;
    }

    print() {
        console.log("=== Output Summary ===");
        console.log(`Message      : ${this.mainMessage}`);
        console.log(`Moves        : ${this.moveCount}`);
        console.log(`Total moves  : ${this.totalMove}`);
        console.log(`Elapsed Time : ${this.time.toFixed(3)} ms`);
        console.log("=======================\n");

        if (Array.isArray(this.states)) {
            for (let i = 0; i < this.states.length; i++) {
                console.log(`Step ${i}:`);
                this.states[i].print();
                console.log("");
            }
        } else {
            console.log("No states to show.");
        }
    }
}

module.exports = {
    OutputState,
    OutputStruct
}