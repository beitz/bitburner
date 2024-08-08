/** @param {NS} ns **/

import { createTestContract, getContractData, handleContractResult } from 'utils/contractUtils.js';

// Total Ways to Sum
// You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


// It is possible write four as a sum in exactly four different ways:

//     3 + 1
//     2 + 2
//     2 + 1 + 1
//     1 + 1 + 1 + 1

// How many different distinct ways can the number 21 be written as a sum of at least two positive integers?


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
