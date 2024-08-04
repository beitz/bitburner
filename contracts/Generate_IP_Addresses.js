/** @param {NS} ns **/

/**
 * This script solves the "Generate IP Addresses" coding contract.
 * Given a string of digits, it returns all possible valid IP addresses that can be created from the string.
 * 
 * Valid IP address: 
 * - Consists of 4 octets, each a number between 0 and 255
 * - An octet can not start with a 0 unless the number itself is 0
 * 
 * Usage:
 * 1. Test mode: run Generate_IP_Addresses.js test
 * 2. Solve contract: run Generate_IP_Addresses.js <contract_file> <host>
 * 
 * Description:
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 * Given the following string containing only digits, return an array with all possible valid IP address combinations that can be created from the string:
 * 452061059
 * Note that an octet cannot begin with a '0' unless the number itself is exactly '0'. For example, '192.168.010.1' is not a valid IP.
 * Examples:
 * 25525511135 -> ["255.255.11.135", "255.255.111.35"]
 * 1938718066 -> ["192.87.180.66"]
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 */

export async function main(ns) {
    const printToTerminal = false; // When automatically executing this script, it's annoying to have the output in the terminal. 
    const isTestMode = ns.args[0] === "test";
    let contractFile, host, inputData;

    if (isTestMode) {
        ({ contractFile, host, inputData } = createTestContract(ns));
    } else {
        [contractFile, host, inputData] = getContractData(ns);
    }

    const solution = generateValidIPAddresses(inputData);

    if (printToTerminal) { ns.tprint(`Attempting to solve contract: ${contractFile} on host: ${host} with input: ${inputData} and solution: ${solution}`) }

    const reward = ns.codingcontract.attempt(solution, contractFile, host);

    handleContractResult(ns, reward, contractFile, host, isTestMode, printToTerminal);
}

function createTestContract(ns) {
    const contractFile = ns.codingcontract.createDummyContract("Generate IP Addresses");
    const host = 'home';
    const inputData = ns.codingcontract.getData(contractFile, host);
    return { contractFile, host, inputData };
}

function getContractData(ns) {
    const contractFile = ns.args[0];
    const host = ns.args[1];

    // check if host  and file actually exist
    if (!ns.serverExists(host)) {
        ns.tprint(`Error 9845247: Host ${host} does not exist!`);
        return;
    }
    if (!ns.fileExists(contractFile, host)) {
        ns.tprint(`Error 9845248: Contract file ${contractFile} does not exist on host ${host}!`);
        return;
    }

    const inputData = ns.codingcontract.getData(contractFile, host);
    return [contractFile, host, inputData];
}

function generateValidIPAddresses(inputData) {
    /**
     * This function generates all possible valid IP addresses from a given string.
     * It does this by trying all possible ways to split the string into four parts,
     * each representing an octet of the IP address.
     *
     * Variables:
     * - s1: Position of the first split
     * - s2: Position of the second split
     * - s3: Position of the third split
     * - octet1: The first part of the IP address
     * - octet2: The second part of the IP address
     * - octet3: The third part of the IP address
     * - octet4: The fourth part of the IP address
     *
     * The function checks if each part (octet) is valid and if so, combines them into a valid IP address.
     */

    const solution = [];
    const len = inputData.length;

    // Loop through possible positions for the first split
    for (let s1 = 1; s1 < len && s1 < 4; s1++) { // s1 must be at least 1 and at most 3 characters from the start
        // Loop through possible positions for the second split
        for (let s2 = s1 + 1; s2 < len && s2 < s1 + 4; s2++) { // s2 must be at least 1 character after s1 and at most 3 characters from s1
            // Loop through possible positions for the third split
            for (let s3 = s2 + 1; s3 < len && s3 < s2 + 4; s3++) { // s3 must be at least 1 character after s2 and at most 3 characters from s2
                const octet1 = inputData.substring(0, s1);
                const octet2 = inputData.substring(s1, s2);
                const octet3 = inputData.substring(s2, s3);
                const octet4 = inputData.substring(s3);

                // Check if all octets are valid
                if (isValidOctet(octet1) && isValidOctet(octet2) && isValidOctet(octet3) && isValidOctet(octet4)) {
                    solution.push(`${octet1}.${octet2}.${octet3}.${octet4}`);
                }
            }
        }
    }

    return solution;
}

function isValidOctet(octet) {
    if (octet.length > 1 && octet.startsWith('0')) {
        return false;
    }
    const num = parseInt(octet);
    return num >= 0 && num <= 255;
}

function handleContractResult(ns, reward, contractFile, host, isTestMode, printToTerminal) {
    if (reward) {
        if (printToTerminal) { ns.tprint(`Contract solved! Reward: ${reward}`); }
    } else {
        if (printToTerminal) { ns.tprint("Contract failed"); }
        if (isTestMode) {
            ns.rm(contractFile, host);
        }
    }
}