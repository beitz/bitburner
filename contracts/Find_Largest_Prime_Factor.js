/** @param {NS} ns **/

import { createTestContract, getContractData, handleContractResult } from 'utils/contractUtils.js';

// Find Largest Prime Factor
// You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


// A prime factor is a factor that is a prime number. What is the largest prime factor of 632032381?


// If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.

/**
 * This script solves the "Find Largest Prime Factor" coding contract.
 * 
 * Usage:
 * 1. Test mode: run Find_Largest_Prime_Factor.js test
 * 2. Solve contract: run Find_Largest_Prime_Factor.js <contract_file> <host>
 * 
 */

export async function main(ns) {
    let contractFile, host, inputData;
    const isTestMode = ns.args[0] === "test";

    if (isTestMode) {
        [contractFile, host, inputData] = createTestContract(ns, "Find Largest Prime Factor");
    } else if (ns.args.length === 2) {
        [contractFile, host, inputData] = getContractData(ns, ns.args[0], ns.args[1]);
    } else {
        ns.tprint("Usage:");
        ns.tprint("1. Test mode: run Find_Largest_Prime_Factor.js test");
        ns.tprint("2. Solve contract: run Find_Largest_Prime_Factor.js <contract_file> <host>");
        return;
    }
    
    // const solution = do stuff (inputData);

    if (isTestMode) {
        ns.tprint(`Attempting to solve contract: ${contractFile} on host: ${host} with input: ${inputData} and solution: ${solution}`)
    }

    const reward = ns.codingcontract.attempt(solution, contractFile, host);
    await handleContractResult(ns, reward, contractFile, host, isTestMode, "Find Largest Prime Factor");
}

// ------------------ functions ------------------
