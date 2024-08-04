/** @param {NS} ns **/

// ------------------ description ------------------
// You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
// Given the following string containing only digits, return an array with all possible valid IP address combinations that can be created from the string:
// 452061059
// Note that an octet cannot begin with a '0' unless the number itself is exactly '0'. For example, '192.168.010.1' is not a valid IP.
// Examples:
// 25525511135 -> ["255.255.11.135", "255.255.111.35"]
// 1938718066 -> ["193.87.180.66"]
// If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.

// todo: if we try to solve a contract that doesn't exist, we get a runtime error. prevent this somehow at some point. 

export async function main(ns) {
    ns.tprint("running Generate IP Addresses contract with args: " + ns.args);

    // ------------------ test ------------------
    if (ns.args[0] === "test") { // create dummy contract of type generate ip addresses
        var contractFile = ns.codingcontract.createDummyContract("Generate IP Addresses");
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
    
    // first let's go through the the process real quick
    // we have 4 octets in an IP address, so for the string we can define 4 positions where we can split the string
    // at first the first 3 positions will have a length of 1 with the last one being filled with the rest of the string
    // each iteration we increase the length of the last position by 1 until we reach the end of the string
    // then we increment the second to last position by 1 and reset the last position to 1, etc. 
    // wo do this until all possible combinations have been tested. 
    // for the testing, we simply check if the number is within the range of 0 and 255 and if it starts with a 0
    
    let splitPos1 = 1;
    let splitPos2 = 1;
    let splitPos3 = 1;
    let octet1, octet2, octet3, octet4;
    let solution = [];
    
    ns.tprint(`inputData: ${inputData}`);

    while (splitPos1 < inputData.length) {
        while (splitPos2 < inputData.length - splitPos1) {
            while (splitPos3 < inputData.length - splitPos1 - splitPos2) {
                octet1 = inputData.substring(0, splitPos1);
                octet2 = inputData.substring(splitPos1, splitPos1 + splitPos2);
                octet3 = inputData.substring(splitPos1 + splitPos2, splitPos1 + splitPos2 + splitPos3);
                octet4 = inputData.substring(splitPos1 + splitPos2 + splitPos3);
                // ns.tprint(`${splitPos1}|${splitPos2}|${splitPos3} octet1: ${octet1}, octet2: ${octet2}, octet3: ${octet3}, octet4: ${octet4}`);
                // if first character is a 0 in any of the octets, we skip this iteration
                splitPos3++;
                if (octet1.startsWith('0') || octet2.startsWith('0') || octet3.startsWith('0') || octet4.startsWith('0')) {
                    continue;
                }
                // we check the length of each octet and if it is longer than 3, we skip this iteration
                if (octet1.length > 3 || octet2.length > 3 || octet3.length > 3 || octet4.length > 3) {
                    continue;
                }
                // we convert each octet into a number and check if its within the rance of 0 and 255
                octet1 = parseInt(octet1);
                octet2 = parseInt(octet2);
                octet3 = parseInt(octet3);
                octet4 = parseInt(octet4);
                if (octet1 >= 0 && octet1 <= 255 && octet2 >= 0 && octet2 <= 255 && octet3 >= 0 && octet3 <= 255 && octet4 >= 0 && octet4 <= 255) {
                    let ip = `${octet1}.${octet2}.${octet3}.${octet4}`;
                    solution.push(ip);
                }
            }
            splitPos2++;
            splitPos3 = 1;
        }
        splitPos1++;
        splitPos2 = 1;
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