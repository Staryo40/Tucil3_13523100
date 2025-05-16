class CarInfo {
    constructor(orientation, length, position) {
        this.orientation = orientation; // '-' or '|'
        this.length = length;  
        this.position = position; // most top-left part of the car
    }
    
    print(symbol) {
        console.log(`Car '${symbol}': orientation='${this.orientation}', length=${this.length}, position=[${this.position[0]}, ${this.position[1]}]`);
    }
}

class PuzzleState {
    constructor(row, col, board, goalPos, cars) {
        this.row = row;              
        this.col = col;         
        this.board = board;            // 1D string of size row*col
        this.goalPos = goalPos;        // [r, c]
        this.cars = cars;              // Map<char, CarInfo>

        this.rc2i = (r, c) => r * this.col + c;
        this.at = (r, c) => {
            if (r < 0 || r >= this.row || c < 0 || c >= this.col) return '@';
            return this.board[this.rc2i(r, c)];
        };
    }

    print() {
        console.log("=== PuzzleState ===");
        console.log("Board:");
        for (let r = 0; r < this.row; r++) {
            let line = "";
            for (let c = 0; c < this.col; c++) {
                line += this.at(r, c);
            }
            console.log(line);
        }

        console.log("\nCars:");
        for (const [symbol, car] of this.cars.entries()) {
            car.print(symbol);
        }

        console.log(`\nGoal Position: [${this.goalPos[0]}, ${this.goalPos[1]}]`);
        console.log("===================");
    }
}

class SearchNode {
    constructor(state, cost, parent = null, g = 0) {
        this.state = state;       // PuzzleState object 
        this.parent = parent;     // SearchNode object 
        this.g = g;               // Int (path so far)
        this.cost = cost;         // Cost of searchnode
    }
}

module.exports = {
    PuzzleState,
    CarInfo,
    SearchNode
};
