/** @param {NS} ns **/

import { createTestContract, getContractData, handleContractResult } from 'utils/contractUtils.js';

/**
 * This script solves the "Minimum Path Sum in a Triangle" coding contract.
 * Given a triangle represented as a 2D array of numbers, it finds the minimum path sum from top to bottom.
 * In each step, you may only move to adjacent numbers in the row below.
 * 
 * Usage:
 * 1. Test mode: run Minimum_Path_Sum_Triangle.js test
 * 2. Solve contract: run Minimum_Path_Sum_Triangle.js <contract_file> <host>
 * 
 * Description:
 * Given a triangle, find the minimum path sum from top to bottom. In each step of the path, you may only move to adjacent numbers in the row below.
 * 
 * Example:
 * [
 *     [2],
 *    [3,4],
 *   [6,5,7],
 *  [4,1,8,3]
 * ]
 * The minimum path sum is 11 (2 -> 3 -> 5 -> 1).
 */

export async function main(ns) {
    let contractFile, host, inputData;
    const isTestMode = ns.args[0] === "test";

    if (isTestMode) {
        ({ contractFile, host, inputData } = createTestContract(ns, "Minimum Path Sum in a Triangle"));
    } else if (ns.args.length === 2) {
        [contractFile, host, inputData] = getContractData(ns, ns.args[0], ns.args[1]);
    } else {
        ns.tprint("Usage:");
        ns.tprint("1. Test mode: run Minimum_Path_Sum_Triangle.js test");
        ns.tprint("2. Solve contract: run Minimum_Path_Sum_Triangle.js <contract_file> <host>");
        return;
    }
    
    const solution = findMinimumPathSum(inputData);

    if (isTestMode) {
        ns.tprint(`Attempting to solve contract: ${contractFile} on host: ${host} with input: ${inputData} and solution: ${solution}`);
    }

    const reward = ns.codingcontract.attempt(solution, contractFile, host);
    await handleContractResult(ns, reward, contractFile, host, isTestMode, "Minimum Path Sum in a Triangle");
}

// ------------------ functions ------------------
function findMinimumPathSum(triangle) { // Finds the minimum path sum in a triangle from top to bottom
    /**
     * This function finds the minimum path sum in a triangle from top to bottom.
     * It uses dynamic programming to achieve this by modifying the triangle in place.
     * 
     * This function goes through the triangle from the second last row to the first row.
     * For each number in a row, it adds the minimum of the two adjacent numbers in the row below.
     * Doing this we eseentially take the lowest value from the bottom and move it up.
     * The final result is the minimum path sum at the top of the triangle.
     * 
     * Variables:
     * - triangle: 2D array representing the triangle
     */

    for (let row = triangle.length - 2; row >= 0; row--) {
        for (let col = 0; col < triangle[row].length; col++) {
            triangle[row][col] += Math.min(triangle[row + 1][col], triangle[row + 1][col + 1]);
        }
    }

    return triangle[0][0];
}
