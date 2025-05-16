class CarInfo {
    constructor(orientation, length, position) {
        this.orientation = orientation; // '-' or '|'
        this.length = length;  
        this.position = position; // most top-left part of the car
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
}

class SearchNode {
    constructor(state, parent = null, g = 0) {
        this.state = state;       // PuzzleState object 
        this.parent = parent;     // SearchNode object 
        this.g = g;               // Int (path so far)
    }
}

module.exports = {
    PuzzleState,
    CarInfo
};
