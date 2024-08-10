/** @param {NS} ns **/

import { createTestContract, getContractData, handleContractResult } from 'utils/contractUtils.js';

// Array Jumping Game II
// You are attempting to solve a Coding Contract. You have 3 tries remaining, after which the contract will self-destruct.


// You are given the following array of integers:

// 0,2,5,3,3,1,2,4,2,3,3,0,2,2

// Each element in the array represents your MAXIMUM jump length at that position. This means that if you are at position i and your maximum jump length is n, you can jump to any position from i to i+n.

// Assuming you are initially positioned at the start of the array, determine the minimum number of jumps to reach the end of the array.

// If it's impossible to reach the end, then the answer should be 0.


// If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.

/**
 * This script solves the "Find Largest Prime Factor" coding contract.
 * 
 * Usage:
 * 1. Test mode: run Array_Jumping_Game.js test
 * 2. Solve contract: run Array_Jumping_Game.js <contract_file> <host>
 * 
 */

export async function main(ns) {
    let contractFile, host, inputData;
    const isTestMode = ns.args[0] === "test";

    if (isTestMode) {
        [contractFile, host, inputData] = createTestContract(ns, "Array Jumping Game II");
    } else if (ns.args.length === 2) {
        [contractFile, host, inputData] = getContractData(ns, ns.args[0], ns.args[1]);
    } else {
        ns.tprint("Usage:");
        ns.tprint("1. Test mode: run Array_Jumping_Game_II.js test");
        ns.tprint("2. Solve contract: run Array_Jumping_Game_II.js <contract_file> <host>");
        return;
    }
    
    const solution = getSteps(ns, inputData);

    if (isTestMode) {
        ns.tprint(`Attempting to solve contract: ${contractFile} on host: ${host} with input: ${inputData} and solution: ${solution}`)
    }

    const reward = ns.codingcontract.attempt(solution, contractFile, host);
    handleContractResult(ns, reward, contractFile, host, isTestMode, "Array Jumping Game II");
}

// ------------------ functions ------------------
function getSteps(ns, inputData) {
    let maxDistance = 0;
    let previousMaxDistance = -1;
    let jumps = 0;

    while (maxDistance !== previousMaxDistance) {
        previousMaxDistance = maxDistance;

        // iterate backwards from the current max distance and sum max distance with current element to see if we can reach a new max distance
        for (let i = maxDistance; i >=0; i--) {
            if (inputData[i] + i > maxDistance) {
                maxDistance = inputData[i] + i;
            }
        }
        jumps++;

        if (previousMaxDistance === maxDistance) { // we're stuck, can't reach the end
            return 0;
        }
        if (maxDistance >= inputData.length - 1) { // we've reached the end!
            return jumps;
        }
    }
}