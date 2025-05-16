class CarInfo {
    constructor(orientation, length, position) {
        this.orientation = orientation; // '-' or '|'
        this.length = length;  
        this.position = position;         
    }
}

class PuzzleState {
    constructor(row, col, state, goalPos, cars, carPositions) {
        this.row = row;              
        this.col = col;         
        this.state = state;            // 1D string of size row*col
        this.goalPos = goalPos;        // [r, c]
        this.cars = cars;              // Map<char, CarInfo>

        this.rc2i = (r, c) => r * this.col + c;
        this.at = (r, c) => {
            if (r < 0 || r >= this.row || c < 0 || c >= this.col) return '@';
            return this.state[this.rc2i(r, c)];
        };
    }
}

module.exports = {
    PuzzleState,
    CarInfo
};
