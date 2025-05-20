/**
 * Represents information about a car on the puzzle board.
 */
class CarInfo {
    /**
   * @param {'-' | '|'} orientation - The orientation of the car: horizontal '-' or vertical '|'.
   * @param {number} length - The length of the car (typically 2 or 3).
   * @param {[number, number]} position - The top-left position of the car as [row, col].
   */
    constructor(orientation, length, position) {
        this.orientation = orientation; // '-' or '|'
        this.length = length;  
        this.position = position; // most top-left part of the car
    }
    
    /**
   * Prints information about the car to the console.
   * @param {string} symbol - The character representing the car.
   */
    print(symbol) {
        console.log(`Car '${symbol}': orientation='${this.orientation}', length=${this.length}, position=[${this.position[0]}, ${this.position[1]}]`);
    }
}

/**
 * Represents a full board state of the Rush Hour puzzle.
 */
class PuzzleState {
    /**
   * @param {number} row - Number of rows in the board.
   * @param {number} col - Number of columns in the board.
   * @param {string} board - 1D string representing the board contents row-major.
   * @param {[number, number]} goalPos - Goal position on the board as [row, col].
   * @param {Map<string, CarInfo>} cars - Map of car symbols to their information.
   */
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

/**
 * Represents a node in the search tree used by pathfinding algorithms.
 */
class SearchNode {
    /**
   * @param {PuzzleState} state - The puzzle state associated with this node.
   * @param {number} cost - The total cost used for prioritization (e.g., g(n) + h(n)).
   * @param {SearchNode|null} [parent=null] - The parent node in the search tree.
   * @param {number} [g=0] - The cost from the start node to this node.
   */
    constructor(state, cost, parent = null, g = 0) {
        this.state = state;       // PuzzleState object 
        this.parent = parent;     // SearchNode object 
        this.g = g;               // Int (path so far)
        this.cost = cost;         // Cost of searchnode
    }
}

/**
 * Represents the result of a search algorithm.
 */
class SearchOutput {
    /**
   * @param {SearchNode|null} node - The final node leading to the solution, or null if not found.
   * @param {number} totalMove - Total number of unique states visited during search.
   */
    constructor(node, totalMove){
        this.node = node;
        this.totalMove = totalMove
    }
}

/**
 * A priority queue specifically for SearchNode instances, ordered by cost.
 */
class SearchNodePriorityQueue {
    constructor() {
        this.data = [];
    }

    /**
     * Inserts a SearchNode into the queue, preserving ascending cost order.
     * In case of tie (equal cost), the new node is inserted after existing ones.
     * @param {SearchNode} node - The SearchNode to enqueue.
     */
    enqueue(node) {
        let low = 0;
        let high = this.data.length;

        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            if (node.cost < this.data[mid].cost) {
                high = mid;
            } else {
                low = mid + 1; 
            }
        }

        this.data.splice(low, 0, node);
    }

    /**
     * Removes and returns the SearchNode with the lowest cost.
     * @returns {SearchNode | undefined}
     */
    dequeue() {
        return this.data.shift();
    }

    /**
     * Returns the number of nodes in the queue.
     * @returns {number}
     */
    get length() {
        return this.data.length;
    }

    /**
     * Checks if the queue is empty.
     * @returns {boolean}
     */
    isEmpty() {
        return this.data.length === 0;
    }
}

module.exports = {
    SearchNodePriorityQueue,
    SearchOutput,
    PuzzleState,
    CarInfo,
    SearchNode
};
