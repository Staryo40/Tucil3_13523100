const {SearchNodePriorityQueue, SearchNode, PuzzleState} = require("../src/struct/puzzlestruct")

const queue = new SearchNodePriorityQueue();

// Create some test nodes
const n1 = new SearchNode(new PuzzleState(100, 1, null, null, null), 3);
const n2 = new SearchNode(new PuzzleState(200, 1, null, null, null), 1);
const n3 = new SearchNode(new PuzzleState(300, 1, null, null, null), 4);
const n4 = new SearchNode(new PuzzleState(400, 1, null, null, null), 3); 
const n5 = new SearchNode(new PuzzleState(500, 1, null, null, null), 2);
const n6 = new SearchNode(new PuzzleState(600, 1, null, null, null), 3); 
const n7 = new SearchNode(new PuzzleState(700, 1, null, null, null), 3); 
const n8 = new SearchNode(new PuzzleState(800, 1, null, null, null), 4); 

// Enqueue in non-sorted order
queue.enqueue(n1);
queue.enqueue(n2);
queue.enqueue(n3);
queue.enqueue(n4);
queue.enqueue(n5);
queue.enqueue(n6);
queue.enqueue(n7);
queue.enqueue(n8);

// Dequeue and print
console.log("Dequeuing nodes in cost order:");
while (!queue.isEmpty()) {
    const node = queue.dequeue();
    console.log(`Cost: ${node.cost}, State: ${node.state.row}`);
}