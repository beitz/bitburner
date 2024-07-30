/** @param {NS} ns **/

// script used to print string to terminal with which we can connect to one specific server
// uses "data/servers.txt" as its data source

// ------------------ functions ------------------
function readData(ns, file) { // function to read the data from a file
    let serverData = [];
    const data = ns.read(file);

    for (let line of data.split('\n')) {
        serverData.push(line.split('|').map(parseValue));
    }

    return serverData;
}

function parseValue(value) { // function to parse the value to the correct type
    // Try to parse as float
    if (!isNaN(value) && value.trim() !== '') {
        return parseFloat(value);
    }
    // Check for boolean values
    if (value.toLowerCase() === 'true') {
        return true;
    }
    if (value.toLowerCase() === 'false') {
        return false;
    }
    // Return the original string if no conversion is possible
    return value;
}


export async function main(ns) {
    if (ns.args.length !== 1) {
        ns.tprint("Usage: run connect.js <hostname>");
        return;
    }
    const hostname = ns.args[0];
    const file = "data/servers_current.txt";
    let serverData = readData(ns, file);

    // get index of the following column headers: 'hostname', 'depth'
    let index_hostname = serverData[0].indexOf('hostname');
    let index_depth = serverData[0].indexOf('depth');

    // find the row of the server with the correct hostname
    let targetServerRow;
    for (let i = 1; i < serverData.length; i++) {
        if (serverData[i][index_hostname] === hostname) {
            targetServerRow = i;
            break;
        }
    }
    
    // now we can start to build the connection string
    let connection = `connect ${hostname}; `;
    let currentDepth = serverData[targetServerRow][index_depth];
    let currentRow = targetServerRow;
    for (let i = currentRow; i > 0; i--) {
        if (serverData[i][index_depth] < currentDepth) {
            connection = `connect ${serverData[i][index_hostname]}; ` + connection;
            currentDepth = serverData[i][index_depth];
        }
    }

    navigator.clipboard.writeText(connection);

    // print the connection string
    ns.tprint("");
    ns.tprint("Connection has been copied to clipboard:");
    ns.tprint(connection);
}
