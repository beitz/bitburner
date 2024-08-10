/** @param {NS} ns **/

import { createTestContract, getContractData, handleContractResult } from 'utils/contractUtils.js';

/**
 * This script solves the "Array Jumping Game" coding contract.
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
        [contractFile, host, inputData] = createTestContract(ns, "Array Jumping Game");
    } else if (ns.args.length === 2) {
        [contractFile, host, inputData] = getContractData(ns, ns.args[0], ns.args[1]);
    } else {
        ns.tprint("Usage:");
        ns.tprint("1. Test mode: run Array_Jumping_Game.js test");
        ns.tprint("2. Solve contract: run Array_Jumping_Game.js <contract_file> <host>");
        return;
    }
    
    const solution = targetReachable(inputData);

    if (isTestMode) {
        ns.tprint(`Attempting to solve contract: ${contractFile} on host: ${host} with input: ${inputData} and solution: ${solution}`)
    }

    const reward = ns.codingcontract.attempt(solution, contractFile, host);
    handleContractResult(ns, reward, contractFile, host, isTestMode, "Array Jumping Game");
}

// ------------------ functions ------------------
function targetReachable(inputData) {
    let maxDistance = 0;
    let previousMaxDistance = -1;

    while (maxDistance !== previousMaxDistance) {
        previousMaxDistance = maxDistance;

        // iterate backwards from the current max distance and sum max distance with current element to see if we can reach a new max distance
        for (let i = maxDistance; i >=0; i--) {
            if (inputData[i] + i > maxDistance) {
                maxDistance = inputData[i] + i;
            }
        }

        if (previousMaxDistance === maxDistance) { // we're stuck, can't reach the end
            return 0;
        }
        if (maxDistance >= inputData.length - 1) { // we've reached the end!
            return 1;
        }
    }
}