/** @param {NS} ns **/

/**
 * This is a collection of commonly used functions to work with coding contracts.
 */

export function createTestContract(ns, contractType) { // Create a dummy contract for testing
    const contractFile = ns.codingcontract.createDummyContract(contractType);
    const host = 'home';
    const inputData = ns.codingcontract.getData(contractFile, host);
    return { contractFile, host, inputData };
}

export function getContractData(ns, contractFile, host) { // Get contract data from a file on a host
    // Check if host and file actually exist
    if (!ns.serverExists(host)) {
        ns.tprint(`Error 9845247: Host ${host} does not exist!`);
        return null;
    }
    if (!ns.fileExists(contractFile, host)) {
        ns.tprint(`Error 9845248: Contract file ${contractFile} does not exist on host ${host}!`);
        return null;
    }

    const inputData = ns.codingcontract.getData(contractFile, host);
    return { contractFile, host, inputData };
}

export function handleContractResult(ns, reward, contractFile, host, isTestMode) { // Handle the result of a contract
    if (reward) {
        if (isTestMode) { ns.tprint(`Contract solved! Reward: ${reward}`); }
    } else {
        if (isTestMode) {
            ns.tprint("Contract failed");
            ns.rm(contractFile, host);
        }
    }
}
