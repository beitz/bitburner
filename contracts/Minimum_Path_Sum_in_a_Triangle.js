/** @param {NS} ns **/

// ------------------ description ------------------
// Given a triangle, find the minimum path sum from top to bottom. In each step of the path, you may only move to adjacent numbers in the row below. The triangle is represented as a 2D array of numbers:
// [
//             [6],
//            [9,5],
//           [9,6,6],
//          [2,2,7,8],
//         [7,4,8,1,9],
//        [6,3,6,8,7,1],
//       [4,1,1,1,5,4,2],
//      [4,5,4,7,8,2,1,6],
//     [8,3,3,2,8,7,6,4,8],
//    [7,5,3,4,3,2,2,9,9,7],
//   [9,1,8,7,4,2,5,6,5,6,9]
// ]
// Example: If you are given the following triangle:
// [
//      [2],
//     [3,4],
//    [6,5,7],
//   [4,1,8,3]
// ]
// The minimum path sum is 11 (2 -> 3 -> 5 -> 1).
// If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.

// todo: if we try to solve a contract that doesn't exist, we get a runtime error. prevent this somehow at some point. 

export async function main(ns) {
    ns.tprint("running Minimum Path Sum in a Triangle contract with args: " + ns.args);

    // ------------------ test ------------------
    if (ns.args[0] === "test") { // create dummy contract of type generate ip addresses
        var contractFile = ns.codingcontract.createDummyContract("Minimum Path Sum in a Triangle");
        var host = 'home';
        var inputData = ns.codingcontract.getData(contractFile, host);
        var testing = true;
        ns.tprint(`created dummy contract: ${contractFile} on host: ${host}`);
    } else { // first arg = contract file, second arg = host
        var contractFile = ns.args[0];
        var host = ns.args[1];
        var inputData = ns.codingcontract.getData(contractFile, host);
        ns.tprint(`contract file: ${contractFile}, host: ${host}, inputData: ${inputData}`);
    }

    // ------------------ solution ------------------

    let solution = 1000000000; // initialize solution with a stupid high number

    // first let's go through the the process real quick
    // we have a 2d array representing a triangle, e.g. [[2], [3,4], [6,5,7], [4,1,8,3]]
    // we go through the array one column at a time
    // we save the minimum sum in the variable solution. if a new minimum is found, we overwrite.
    // we can only move directly to the column below or the column below and to the right.
    // to achieve that we create a new 1d array with pointers to the columns in the 2d array.

    let pointers = [];
    for (let i = 0; i < inputData.length; i++) {
        pointers.push(0);
    }

    ns.tprint(inputData);
    let solutionFound = false;

    while (!solutionFound) {
        let currentPathSum = 0;
        // ns.tprint(`pointers: ${pointers}`);
        for (let i = 0; i < pointers.length; i++) {
            currentPathSum += inputData[i][pointers[i]];
            // ns.tprint(`inputData[${i}][${pointers[i]}]: ${inputData[i][pointers[i]]}`);
        }
        // ns.tprint(`currentPathSum: ${currentPathSum}   ,  solution: ${solution}`);
        if (currentPathSum < solution) {
            solution = currentPathSum;
        }
        // we go through the pointers from last to first. 
        // if the last pointer is the same as the one above, we increment it. Else we go look at the one above with that same logic. 
        for (let i = pointers.length - 1; i >= 0; i--) {
            if (pointers[i] === pointers[i - 1]) {
                pointers[i]++;
                // we reset all pointers below the current one
                for (let j = i + 1; j < pointers.length; j++) {
                    pointers[j] = pointers[i];
                }
                break;
            }
            // if we reach the first pointer, we've gone through the whole array
            if (i === 0) {
                // ns.tprint(`solution found!`);
                solutionFound = true;
                break;
            }
        }
    }

    // ------------------ submit ------------------

    ns.tprint(`attempting to solve with input: ${inputData} and solution: ${solution}`);
    let reward = ns.codingcontract.attempt(solution, contractFile, host);
    if (reward) {
        ns.tprint(`contract solved! reward: ${reward}`);
    } else {
        ns.tprint("contract failed");
        if (testing) {
            ns.rm(contractFile, host);
        }
    }
}