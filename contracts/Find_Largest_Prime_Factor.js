/** @param {NS} ns **/

import { createTestContract, getContractData, handleContractResult } from 'utils/contractUtils.js';

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
    
    // let's time this function 
    // let start = new Date().getTime();
    const solution = findLargestPrimeFactor(ns, inputData);
    // let end = new Date().getTime();
    // ns.tprint(`Time taken: ${end - start} ms`);
    // result: All contracts can be solved inbetween 0-1 ms. Good enough for me. 

    if (isTestMode) {
        ns.tprint(`Attempting to solve contract: ${contractFile} on host: ${host} with input: ${inputData} and solution: ${solution}`)
    }

    const reward = ns.codingcontract.attempt(solution, contractFile, host);
    await handleContractResult(ns, reward, contractFile, host, isTestMode, "Find Largest Prime Factor");
}

// ------------------ functions ------------------
function findLargestPrimeFactor(ns, inputData) {
    let number = parseInt(inputData);
    let maxNumber = Math.ceil(Math.sqrt(number));
    let largestPrimeFactor = 1;

    let counter = 0;

    // @ignore-infinite
    while (true) {
        counter++;
        if (counter > 30) {
            ns.tprint("Counter exceeded 30. Exiting loop.");
            break;
        }

        // ns.tprint(`number: ${number}, largestPrimeFactor: ${largestPrimeFactor}, maxNumber: ${maxNumber}`);
        for (let i = 2; i <= maxNumber; i++) {
            if (number % i === 0) {
                if (i > largestPrimeFactor || i === number) {
                    largestPrimeFactor = i;
                }
                number = number / i;
                break;
            }
            if (i === maxNumber) {
                if (number > largestPrimeFactor) {
                    largestPrimeFactor = number;
                    break;
                }
            }
        }

        if (number === largestPrimeFactor || largestPrimeFactor > number) {
            if (number > largestPrimeFactor) {
                largestPrimeFactor = number;
            }
            break;
        }
    }

    return largestPrimeFactor;
}
