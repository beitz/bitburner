/** @param {NS} ns **/

import { createTestContract, getContractData, handleContractResult } from 'utils/contractUtils.js';

// Shortest Path in a Grid
// You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


// You are located in the top-left corner of the following grid:

//   [[0,0,0,0,0,1,1,1,0,1],
//    [0,0,0,0,0,0,0,0,0,1],
//    [0,0,0,0,1,0,1,1,0,0],
//    [0,0,0,1,1,0,0,1,1,0],
//    [0,0,0,0,0,0,0,1,0,0],
//    [0,1,0,0,1,1,0,0,0,0],
//    [0,1,0,0,1,0,0,0,0,0],
//    [0,0,0,0,1,0,0,0,0,0]]

// You are trying to find the shortest path to the bottom-right corner of the grid, but there are obstacles on the grid that you cannot move onto. These obstacles are denoted by '1', while empty spaces are denoted by 0.

// Determine the shortest path from start to finish, if one exists. The answer should be given as a string of UDLR characters, indicating the moves along the path

// NOTE: If there are multiple equally short paths, any of them is accepted as answer. If there is no path, the answer should be an empty string.
// NOTE: The data returned for this contract is an 2D array of numbers representing the grid.

// Examples:

//     [[0,1,0,0,0],
//      [0,0,0,1,0]]

// Answer: 'DRRURRD'

//     [[0,1],
//      [1,0]]

// Answer: ''


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
