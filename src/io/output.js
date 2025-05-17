const { OutputStruct, OutputState } = require("../struct/outputstruct");

function outputToFile(output){

}

function outputCreation(time, totalMove, lastNode){
    const moveCount = countNodes(lastNode)
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
    outputCreation
}