/** @param {NS} ns **/

import { readData } from 'utils/utils.js';

/**
 * This script is used to quickly connect to a specific server. 
 * It reads the server data from "data/servers_current.txt" and creates a connection string to the specified server.
 * This string is put into the clipboard so it can be pasted into the terminal.
 * 
 * todo: figure out how to directly connect without having to paste the string into the terminal
 * 
 * Usage: 
 * 1. run connect.js <hostname>
 * 2. paste the connection string into the terminal to connect to the specified server
 */

export async function main(ns) {
    // ------------------ check arguments ------------------
    if (ns.args.length !== 1) {
        ns.tprint("Usage: run connect.js <hostname>");
        return;
    }

    // ------------------ variables ------------------
    const hostname = ns.args[0];
    const filePath = "data/servers_current.txt";
    const serverData = readData(ns, filePath);

    // ------------------ check data and files ------------------
    // check if the file was read correctly
    if (!serverData || serverData.length === 0) {
        ns.tprint(`Error 8474: Could not read data from ${filePath}`);
        return;
    }

    const targetServerRow = findServerRow(serverData, hostname);
    // check if the server was found
    if (targetServerRow === -1) {
        ns.tprint(`Error 8475: Could not find server with hostname ${hostname}`);
        return;
    }

    // ------------------ main ------------------
    const connectionString = buildConnectionString(serverData, targetServerRow);
    navigator.clipboard.writeText(connectionString); // copy the connection string to the clipboard

    ns.tprint("\nConnection string has been copied to clipboard:");
    ns.tprint(connectionString);
}

// ------------------ functions ------------------
function findServerRow(serverData, hostname) { // Finds the row of the target server in the server data
    const indexHostname = serverData[0].indexOf('hostname');

    for (let row = 1; row < serverData.length; row++) {
        if (serverData[row][indexHostname] === hostname) {
            return row;
        }
    }

    return -1;
}

function buildConnectionString(serverData, targetServerRow) { // Builds connection string to target server
    const indexHostname = serverData[0].indexOf('hostname');
    const indexDepth = serverData[0].indexOf('depth');
    let connectionString = `connect ${serverData[targetServerRow][indexHostname]}; `; // initialize with the target server
    let currentDepth = serverData[targetServerRow][indexDepth];

    for (let row = targetServerRow; row > 0; row--) {
        if (serverData[row][indexDepth] < currentDepth) {
            // we add the next server to the beginning of the string
            connectionString = `connect ${serverData[row][indexHostname]}; ` + connectionString;
            currentDepth = serverData[row][indexDepth];
        }
    }

    return connectionString;
}
