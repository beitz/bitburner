/** @param {NS} ns */

// script that scans all servers recursively and stores relevant server data in a 2d array that is then written to a file.

const serverDataFile = 'data/servers.txt';

export async function main(ns) {
    function getDateTime() { // Function that returns the current date and time as a string
        var now = new Date();
        var dateFormatted = now.toLocaleDateString(`sv`);
        var timeFormatted = now.toLocaleTimeString(`sv`);
        return `${dateFormatted} ${timeFormatted}`;
    }
    
    function writeData(file, data) { // function to write the data to a file
        let formattedData = ''; // data we will write to the file
    
        // check if is 2d array
        if (Array.isArray(data) && Array.isArray(data[0])) {
            // we have a 2d array and everything is fine, so we can print the contents
            for (let i = 0; i < data.length; i++) { // rows
                for (let j = 0; j < data[i].length; j++) { // columns
                    // lines are separated by a newline character, columns are separated by a | character
                    if (j === data[i].length - 1) {
                        formattedData += data[i][j] + '\n';
                    } else {
                        formattedData += data[i][j] + '|';
                    }
                }
            }
        } else {
            // we have a 1d array or something else, so we need to print an error message and return
            ns.tprint(`Error: Data is not a 2d array. Data: ${data}`);
            return;
        }
        ns.write(file, formattedData, 'a');
    
        // we also write to a second file with a suffix in the file name that is not appended but overwritten
        const file_current = file.replace('.txt', '_current.txt');
        // we add the header to the beginning of the file. we convert the 2d array into a string with | as column separator and \n as row separator
        formattedData = serverDataHeader.map(row => row.join('|')).join('\n') + '\n' + formattedData;
        ns.write(file_current, formattedData, 'w');
    }

    // ------------------ variables ------------------
    let serverData = []; // 2d array that will hold all the server data
    let servers = []; // array that will hold the servers we get from the scan function
    let serverDataHeader = [['date time', 'pos.', 'scanned', 'hostname', 'hasAdminRights', 'numOpenPortsRequired', 'maxRam', 'ramUsed', 
        'purchasedByPlayer', 'moneyAvailable', 'moneyMax', 'hackDifficulty', 
        'minDifficulty', 'currentHackingLevel', 'requiredHackingSkill', 'depth']];

    // if a server.txt file doesn't exist yet, we initialize it with the header row
    if (!ns.fileExists(serverDataFile)) {
        writeData(serverDataFile, serverDataHeader);
    }

    // ------------------ scan servers ------------------
    while (true) {
        // we scan the current server and push all newly found servers to the serverData array
        // we continue to do this until we have scanned all servers in the network
        // in this loop the serverData array will have the following columns: 
        //   date time, position, scanned, hostname
        //   [0] data time = "yyyy-mm-dd hh:mm:ss"
        //   [1] position = "1" for the first server, "1.1" for the first child, "1.2" for the second child, etc.
        //   [2] scanned = true or false, depending on whether the server has been scanned yet. Used to prevent looping infinitely through the same servers
        //   [3] hostname = the hostname of the server

        if (serverData.length === 0) { // in the first loop we start by scanning the home server
            servers = ns.scan("home");
            for (let i = 0; i < servers.length; i++) { // here we add all the first set of servers to the serverData array
                serverData.push([getDateTime(), (i+1).toString(), false, servers[i]]);
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
                            serverData.splice(i + 1, 0, [getDateTime(), `${serverData[i][1]}.${j+1}`, false, servers[j]]);
                        }
                    }
                    continue; // break out of the for loop
                }
            }
            break; // if there is no server left to scan, we break out of the while loop
        }
    }

    // now we should have the serverData array filled with all the servers in the network, including the date time, position, scanned and name

    // then we iterate through the array and add all kinds of data relevant to the server into additional columns
    for (let i = 0; i < serverData.length; i++) {
        let server = ns.getServer(serverData[i][3]);
        // we start with the date time, position, scanned and hostname
        let newServerData = [serverData[i][0], serverData[i][1], serverData[i][2], serverData[i][3]]; 
        newServerData[4] = server.hasAdminRights; // true if the player has admin rights on the server
        newServerData[5] = server.numOpenPortsRequired; // number of open ports required to hack the server
        newServerData[6] = server.maxRam; // max ram of the server
        newServerData[7] = server.ramUsed; // ram used by the server
        newServerData[8] = server.purchasedByPlayer; // true if the player has purchased the server
        newServerData[9] = server.moneyAvailable; // money that is currently on the server
        newServerData[10] = server.moneyMax; // maximum money on the server
        newServerData[11] = server.hackDifficulty; // security level of the server
        newServerData[12] = server.minDifficulty; // minimum security level
        newServerData[13] = ns.getHackingLevel(); // current hacking level of the player
        newServerData[14] = server.requiredHackingSkill; // required hacking skill to hack the server
        newServerData[15] = serverData[i][1].split('.').length - 1; // depth of the server in the network

        serverData[i] = newServerData;
    }
    
    // now we can store all of that in the servers.txt file so other scripts can use it for something
    writeData(serverDataFile, serverData);
}