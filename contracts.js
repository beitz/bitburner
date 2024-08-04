/** @param {NS} ns **/

import { readData, writeData } from 'utils/utils.js';

/**
 * This script is used to solve coding contracts. 
 * We pass it the contract as an argument. 
 * This script will try to figure out the contract type and execute the correct script to solve it.
 * 
 * Usage: 
 * run contracts.js <action> <args>
 * actions:
 * - list: list all contracts on all servers
 * - solve <contract> <host>: attempt to solve the <contract> on the <host>
 */

export async function main(ns) {
    // ------------------ check arguments ------------------
    if (ns.args.length === 0) { // if no arguments are passed, print help
        ns.tprint("Usage: run contracts.js <action> <args>");
        ns.tprint("Actions:");
        ns.tprint("- list: list all contracts on all servers");
        ns.tprint("- solve <contract> <host>: attempt to solve the <contract> on the <host>");
        return;
    } 
    let action, contractFile, hostname; // action to perform
    if (ns.args[0] === 'solve') {
        action = 'solve';
        contractFile = ns.args[1];
        hostname = ns.args[2];
    } else if (ns.args[0] === 'list') {
        action = 'list';
    } else {
        ns.tprint(`Error 7493: Unknown action ${ns.args[0]}`);
        return;
    }
    
    // ------------------ variables ------------------
    let contractScriptsFile = "contracts/contract_scripts.txt";
    let contractData; // 2d array containing the contract type, script file and status

    if (!ns.fileExists(contractScriptsFile)) { // if the contractScriptsFile doesn't exist, initialize it
        initializeContractScripts(ns, contractScriptsFile);
    }
    contractData = readData(ns, contractScriptsFile);

    let serverData = readData(ns, "data/servers_current.txt"); // 2d array containing the server data

    // ------------------ main ------------------
    if (action === 'list') {
        listContracts(ns, serverData);
    } else if (action === 'solve') {
        solveContract(ns, contractFile, hostname, contractData);
    }
}

function initializeContractScripts(ns, contractScriptsFile) { // initialize the contractScriptsFile with the contract types
    let contractData = [["contract type", "script file", "status"]]; // header of the 2d array
    let contracts = ns.codingcontract.getContractTypes(); // list of all contract types
    for (let i = 0; i < contracts.length; i++) {
        contractData.push([contracts[i], `contracts/${contracts[i].replace(/ /g, '_')}.js`, "todo"]);
    }
    writeData(ns, contractScriptsFile, contractData);

    // todo: when we initialize, maybe also create the script files if they don't exist
    //       if they exist, then run them and if we can solve, say 100 out of 100 contracts, then mark them as done
    //       maybe we could also add the action "update" to this script to update the contract scripts and mark them as done
}

function listContracts(ns, serverData) { // list all contracts on all servers
    for (let row = 1; row < serverData.length - 1; row++) {
        let index_hostname = serverData[0].indexOf('hostname');
        let hostname = serverData[row][index_hostname];
        let files = ns.ls(hostname);
        for (let file of files) {
            if (file.includes("contract-")) {
                ns.tprint(`Found contract on ${hostname}: ${file}, type: ${ns.codingcontract.getContractType(file, hostname)}`);
                // todo: save the files in a 2d array
                //       then figure out the longest string in each column
                //       then print the files with the correct spacing to make it look nice in the terminal
                //       also, add column to the right with a ✔ if the contract script is done
            }
        }
    }
}

function solveContract(ns, contractFile, hostname, contractData) {
    // get the type of the contract
    let contractType = ns.codingcontract.getContractType(contractFile, hostname);
    // check if the script for solving the contract is done
    if (isContractDone(contractData, contractType)) {
        // get the script to solve the contract
        let contractScriptFile = getContractScriptFile(contractData, contractType);

        // check if we have enough RAM to execute the script
        let freeRam = ns.getServerMaxRam('home') - ns.getServerUsedRam('home');
        let scriptRam = ns.getScriptRam(contractScriptFile, 'home');
        if (freeRam < scriptRam) {
            ns.tprint(`Error 8715: Not enough free RAM to execute script: ${contractScriptFile}. We have ${Math.floor(freeRam)} RAM available, but we need ${scriptRam} RAM`);
            return;
        }

        // attempt to run the script to solve the contract
        ns.exec(contractScriptFile, 'home', 1, contractFile, hostname);
    } 
}

function isContractDone(contractData, contractType) { // check if the contract script is done
    for (let row = 1; row < contractData.length; row++) {
        if (contractData[row][0] === contractType) {
            return contractData[row][2] === "done";
        }
    }
    return false;
}

function getContractScriptFile(contractData, contractType) { // get the script file to solve the contract
    for (let row = 1; row < contractData.length; row++) {
        if (contractData[row][0] === contractType) {
            return contractData[row][1];
        }
    }
    return "";
}
