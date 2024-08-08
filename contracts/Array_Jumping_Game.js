/** @param {NS} ns **/

import { createTestContract, getContractData, handleContractResult } from 'utils/contractUtils.js';

// Array Jumping Game
// You are attempting to solve a Coding Contract. You have 1 tries remaining, after which the contract will self-destruct.


// You are given the following array of integers:

// 0,6,10,0,5,5,6,1,2,0,3,0,0,2,7

// Each element in the array represents your MAXIMUM jump length at that position. This means that if you are at position i and your maximum jump length is n, you can jump to any position from i to i+n.

// Assuming you are initially positioned at the start of the array, determine whether you are able to reach the last index.

// Your answer should be submitted as 1 or 0, representing true and false respectively.


// If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.

/**
 * This script solves the "Find Largest Prime Factor" coding contract.
 * 
 * Usage:
 * 1. Test mode: run Find_Largest_Prime_Factor.js test
 * 2. Solve contract: run Find_Largest_Prime_Factor.js <contract_file> <host>
 * 
 * Examples:
 * 
 */

export async function main(ns) {
    let contractFile, host, inputData;
    const isTestMode = ns.args[0] === "test";

    if (isTestMode) {
        [contractFile, host, inputData] = createTestContract(ns, "Generate IP Addresses");
    } else if (ns.args.length === 2) {
        [contractFile, host, inputData] = getContractData(ns, ns.args[0], ns.args[1]);
    } else {
        ns.tprint("Usage:");
        ns.tprint("1. Test mode: run Generate_IP_Addresses.js test");
        ns.tprint("2. Solve contract: run Generate_IP_Addresses.js <contract_file> <host>");
        return;
    }
    
    // const solution = do stuff (inputData);

    if (isTestMode) {
        ns.tprint(`Attempting to solve contract: ${contractFile} on host: ${host} with input: ${inputData} and solution: ${solution}`)
    }

    const reward = ns.codingcontract.attempt(solution, contractFile, host);
    handleContractResult(ns, reward, contractFile, host, isTestMode, "Generate IP Addresses");
}

// ------------------ functions ------------------
