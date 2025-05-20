
/**
 * Represents the structured input for a Rush Hour puzzle.
 *
 * This class encapsulates all relevant board metadata and parsing results,
 * and is typically constructed after reading and validating an input file.
 */
class InputStruct {
   /**
   * @param {number} row - The number of rows in the puzzle board.
   * @param {number} col - The number of columns in the puzzle board.
   * @param {number} count - The total number of distinct cars parsed.
   * @param {string[]} state - The board state as an array of strings (each row as a string).
   * @param {[number, number]} goalPos - The position of the goal cell, represented as [row, col].
   * @param {string[]} [errors=[]] - An optional list of error messages from input validation.
   */
    constructor(row, col, count, state, goalPos, errors = []) {
        this.row = row;                
        this.col = col;     
        this.count = count;          
        this.state = state;            
        this.goalPos = goalPos;     // [row, col] array      
        this.errors = errors;   
    }

    print() {
        console.log("=== InputStruct ===");

        console.log(`Rows: ${this.row}, Columns: ${this.col}`);
        console.log(`Number of cars: ${this.count}`);
        console.log("State:");
        for (let i = 0; i < this.row; i++) {
            const rowStr = this.state[i] ? this.state[i].join('') : '';
            console.log(rowStr);
        }

        console.log("Goal Position:", this.goalPos ? `[${this.goalPos[0]}, ${this.goalPos[1]}]` : "null");

        if (this.errors.length > 0) {
            console.log("Errors:");
            for (const err of this.errors) {
                console.log(`  • ${err}`);
            }
        } else {
            console.log("No errors.");
        }

        console.log("===================");
    }
}

module.exports = {
    InputStruct
};
