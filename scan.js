/** @param {NS} ns **/

import { readData, writeData, getDateTime } from 'utils/utils.js';

/**
 * This script scans all servers recursively and stores relevant server data in a 2d array that is then written to a file.
 * 
 * Usage: 
 * run scan.js <args>
 * Arguments:
 * - scan: if 'scan' is provided, the script will scan all servers. 
 * - log: if 'log' is provided, the script will log the data to the file. Otherwise it will print it to the terminal.
 */

// todo: add function to scan how many and which processes are running on each server?

export async function main(ns) {
    // ------------------ check arguments ------------------
    if (ns.args.length === 0) {
        ns.tprint(`Usage: run scan.js <args>`);
        ns.tprint(`Arguments:`);
        ns.tprint(`- scan: if 'scan' is provided, the script will scan all servers.`);
        ns.tprint(`- log: if 'log' is provided, the script will log the data to the file. Otherwise it will print it to the terminal.`);
        return;
    }
    if (!ns.args.includes('scan')) {
        ns.tprint(`Error 48793: No 'scan' argument provided.`);
        return;
    }

    let log = false;
    if (ns.args.includes('log')) log = true;

    // ------------------ variables ------------------
    const serverDataFile = 'data/servers.txt';
    const serverDataLogFile = 'data/servers_log.txt';
    let serverData = []; // 2d array that will hold all the server data
    let servers = []; // array that will hold the servers we get from the scan function
    let serverDataHeader = [['date time', 'pos.', 'scanned', 'hostname', 'hasAdminRights', 'numOpenPortsRequired', 'maxRam', 'ramUsed',
        'purchasedByPlayer', 'moneyAvailable', 'moneyMax', 'hackDifficulty',
        'minDifficulty', 'currentHackingLevel', 'requiredHackingSkill', 'depth', 'files', 'hackable', 'serverGrowth', 'Cores', 'moneyPercent', 'serverValue']];

    // ------------------ main ------------------
    initializeServerDataFile(ns, serverDataFile, serverDataHeader);

    scanServers(ns, serverData);

    saveServerData(ns, serverDataFile, serverDataLogFile, serverData, log);
}

// ------------------ functions ------------------
function isHackable(server) { // function to determine if a server is hackable
    // we determine the amountof ports we can open and how many open ports we need on target server
    // we also determine the hack difficulty of the server and compare it to the player's hacking level
    let openablePorts = 0;
    if (ns.fileExists('BruteSSH.exe', 'home')) openablePorts++;
    if (ns.fileExists('FTPCrack.exe', 'home')) openablePorts++;
    if (ns.fileExists('relaySMTP.exe', 'home')) openablePorts++;
    if (ns.fileExists('HTTPWorm.exe', 'home')) openablePorts++;
    if (ns.fileExists('SQLInject.exe', 'home')) openablePorts++;

    let openPortsRequired = server.numOpenPortsRequired;

    let hackDifficulty = server.requiredHackingSkill;
    let hackingLevel = ns.getHackingLevel();

    if (openablePorts >= openPortsRequired && hackingLevel >= hackDifficulty) {
        return true;
    } else {
        return false;
    }
}

function initializeServerDataFile(ns, serverDataFile, serverDataHeader) { // function to initialize the server data file
    if (!ns.fileExists(serverDataFile)) {
        writeData(ns, serverDataFile, serverDataHeader);
    }
}

function scanServers(ns, serverData) { // function to scan all servers in the network
    // we scan the servers and push all newly found servers to the serverData array
    // we continue to do this until we have scanned all servers in the network
    // we push the following columns: 
    //   date time, position, scanned, hostname
    //   [0] date time = "yyyy-mm-dd hh:mm:ss"
    //   [1] position = "1" for the first server, "1.1" for the first child, "1.2" for the second child, etc.
    //   [2] scanned = true or false, depending on whether the server has been scanned yet. Used to prevent looping infinitely through the same servers
    //   [3] hostname = the hostname of the server

    serverData.unshift([getDateTime(), '-1', true, 'home']); // we add the 'home' server to the top of the serverData array

    while (true) {
        if (serverData.length === 1) { // in the first loop we start by scanning the home server
            servers = ns.scan("home");
            for (let i = 0; i < servers.length; i++) { // here we add all the first set of servers to the serverData array
                serverData.push([getDateTime(), (i + 1).toString(), false, servers[i]]);
            }
        } else {
            // from the second loop onward we iterate through the array and continue to scan all servers that have not been scanned yet
            // if we find a server, we scan it, add the children to the array and restart the while loop to go through all servers in the array again
            // if we don't find a server that has not been scanned yet, we break out of the while loop
            for (let i = 0; i < serverData.length; i++) {
                if (!serverData[i][2]) {
                    servers = ns.scan(serverData[i][3]);
                    servers.shift(); // remove the first server from the list as it is always the parent server
                    serverData[i][2] = true;

                    if (servers.length === 0) { // this happens when a server has no children :(
                        continue; // continue with the next server
                    } else { // if the server has children, we add them to the serverData array
                        for (let j = servers.length - 1; j >= 0; j--) {
                            serverData.splice(i + 1, 0, [getDateTime(), `${serverData[i][1]}.${j + 1}`, false, servers[j]]);
                        }
                    }
                    continue; // break out of the for loop
                }
            }
            break; // if there is no server left to scan, we break out of the while loop
        }
    }
}

function saveServerData(ns, serverDataFile, serverDataLogFile, serverData, log) { // function to save the server data to a file
    for (let row = 0; row < serverData.length; row++) {
        // server data headers atm: [0] date time, [1] position, [2] scanned, [3] hostname
        let server = ns.getServer(serverData[row][3]);
        let hostname = serverData[row][3];
        // we start with the date time, position, scanned and hostname
        let newServerData = [serverData[row][0], serverData[row][1], serverData[row][2], hostname];
        newServerData[4] = server.hasAdminRights; // true if the player has admin rights on the server
        newServerData[5] = server.numOpenPortsRequired; // number of open ports required to hack the server
        newServerData[6] = server.maxRam; // max ram of the server
        newServerData[7] = server.ramUsed; // ram used by the server
        newServerData[8] = server.purchasedByPlayer; // true if the player has purchased the server
        newServerData[9] = (hostname === 'home') ? ns.getServerMoneyAvailable('home') : server.moneyAvailable; // money that is currently on the server
        newServerData[10] = server.moneyMax; // maximum money on the server
        newServerData[11] = server.hackDifficulty; // security level of the server
        newServerData[12] = server.minDifficulty; // minimum security level
        newServerData[13] = ns.getHackingLevel(); // current hacking level of the player
        newServerData[14] = server.requiredHackingSkill; // required hacking skill to hack the server
        newServerData[15] = serverData[row][1].split('.').length - 1; // depth of the server in the network
        newServerData[16] = ns.ls(hostname); // files on the server
        newServerData[17] = isHackable(server); // true if the server is hackable
        newServerData[18] = server.serverGrowth; // server growth
        newServerData[19] = server.cpuCores; // number of CPU cores
        newServerData[20] = server.moneyAvailable / server.moneyMax; // percentage of money available on the server
        newServerData[21] = server.moneyMax / server.minDifficulty * server.cpuCores * server.serverGrowth / 1000000000; // value of the server calculated by arbitrary formula that I just came up with

        serverData[row] = newServerData;
    }

    // now we can store all of that in the servers.txt file so other scripts can use it for something
    writeData(ns, serverDataFile, serverData);
    if (log) writeData(ns, serverDataLogFile, serverData, 'a');
}
