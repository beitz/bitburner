/** @param {NS} ns **/

import { readData } from 'utils/utils.js';

/**
 * This script is used to quickly connect to a specific server. 
 * It reads the server data from "data/servers_current.txt" and creates a connection string to the specified server.
 * This string is put into the clipboard so it can be pasted into the terminal.
 * 
 * It's not cool, but it works. 
 * I'll have to use this until I figure out how to directly connect without having to paste the string.
 * 
 * Usage: 
 * 1. run connect.js <hostname>
 * 2. paste the connection string into the terminal to connect to the specified server
 */

export async function main(ns) {
    if (ns.args.length !== 1) {
        ns.tprint("Usage: run connect.js <hostname>");
        return;
    }

    const hostname = ns.args[0];
    const filePath = "data/servers_current.txt";
    const serverData = readData(ns, filePath);

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

    const connectionString = buildConnectionString(serverData, targetServerRow);
    navigator.clipboard.writeText(connectionString); // copy the connection string to the clipboard

    ns.tprint("\nConnection string has been copied to clipboard:");
    ns.tprint(connectionString);
}

function findServerRow(serverData, hostname) { // Finds the row of the target server in the server data
    const index_hostname = serverData[0].indexOf('hostname');

    for (let i = 1; i < serverData.length; i++) {
        if (serverData[i][index_hostname] === hostname) {
            return i;
        }
    }

    return -1;
}

function buildConnectionString(serverData, targetServerRow) { // Builds connection string to target server
    const index_hostname = serverData[0].indexOf('hostname');
    const index_depth = serverData[0].indexOf('depth');
    let connectionString = `connect ${serverData[targetServerRow][index_hostname]}; `; // initialize with the target server
    let currentDepth = serverData[targetServerRow][index_depth];

    for (let i = targetServerRow; i > 0; i--) {
        if (serverData[i][index_depth] < currentDepth) {
            // we add the next server to the beginning of the string
            connectionString = `connect ${serverData[i][index_hostname]}; ` + connectionString;
            currentDepth = serverData[i][index_depth];
        }
    }

    return connectionString;
}
