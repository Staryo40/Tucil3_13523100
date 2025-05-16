class CarInfo {
    constructor(orientation, length) {
        this.orientation = orientation; // '-' or '|'
        this.length = length;           
    }
}

// InputStruct to hold full puzzle setup
class InputStruct {
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
    CarInfo,
    InputStruct
};
