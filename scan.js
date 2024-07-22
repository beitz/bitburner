/** @param {NS} ns */

// script that scans all servers recursively and stores the data in a 2d array that is then written to a file.
// alternatively, if first argument = true, print all the data on the terminal instead in a nicely formatted table

// const flags = ns.flags(['t', false]);
// fuck it. I can't get those fucking flags to work. I'll have to think of something else. for now I'll leave the function out to print to terminal. 
// maybe I'll write a new script that takes the data from the file and just prints that to the terminal. 

const serverDataFile = 'data/servers.txt';

export async function main(ns) {
    const servers = ns.scan('home');
    // we could also use ns.scan() without any arguments to scan the current server. But this way we can make sure we start at the home server.
    
    // await ns.write('servers.txt', JSON.stringify(servers), 'w');
    // stole this idea from ChatGPT. I like the idea of JSON. 

    // This is the content of the file by the way:
    // ["n00dles","foodnstuff","sigma-cosmetics","joesguns","hong-fang-tea","harakiri-sushi","iron-gym"]
    // So it seems like it works just fine, though I'll have to figure out how to get something like key:value pairs in there.
    // You know, like servers:[array of servers] or something like that. Would make it a bit more readable. 
    // Will be replaced by a 2d array anyway at some point. So I'll get to that when I get to that.

    // I'm just going to keep adding ideas etc here in comments before I forget them.
    // So I want to scan recursively, right? 
    // How about I add yet another column to the 2d array for the level. 
    // home can be 0 for all I care. 
    // then each server connected to home will get a counter, e.g. "1", then "2", then "3" etc.
    // then, once I get to it, I will scan the servers that are connected to those servers. 
    // those servers will get the number from their parent and will add their own number to it. 
    // e.g. "1.1", "1.2", "1.3" etc.
    // maybe I should add a flag to the server object that tells me if I've already scanned it.
    // also I should discard the first server from all all scans as this is always the parent server. 

    // Function to get the current date and time
    function getDateTime() {
        var now = new Date();
        var dateFormatted = now.toLocaleDateString(`sv`);
        var timeFormatted = now.toLocaleTimeString(`sv`);
        return `${dateFormatted} ${timeFormatted}`;
    }

    // variable for 2d array of servers
    let serverData = [];

    // if a server.txt file exists, then just append the data there. otherwise, create a new file and write the header data there.
    if (!ns.fileExists(serverDataFile)) {
        // In case we start writing a new file, here is the header for that data
        let serverDataHeader = [['date time', 'hostname', 'hasAdminRights', 'numOpenPortsRequired', 'maxRam', 'ramUsed', 
            'purchasedByPlayer', 'moneyAvailable', 'moneyMax', 'hackDifficulty', 
            'minDifficulty', 'currentHackingLevel', 'requiredHackingSkill']];
        await ns.write(serverDataFile, JSON.stringify(serverDataHeader));
    }

    // for now, let's start simple and just create a 2d array with all the servers connected to home, go through them and store their data in a 2d array.
    for (let i = 0; i < servers.length; i++) {
        let server = ns.getServer(servers[i]);

        // use the server object to access all the data we need and directly push it into the 2d array
        // we will store the hostname, if we have admin rights, required open ports, available RAM, used RAM, if the server is purchased by the player ...
        // ... the current money, max money, current security level, min security level, current hacking level, required hacking level
        serverData.push([getDateTime(), server.hostname, server.hasAdminRights, server.numOpenPortsRequired, server.maxRam, server.ramUsed, 
            server.purchasedByPlayer, server.moneyAvailable, server.moneyMax, server.hackDifficulty, 
            server.minDifficulty, ns.getHackingLevel(), server.requiredHackingSkill]);
    }

    // todo: put all of this into a separate file I guess since this doesn't work. 
        // // first we go through the array and clean up the data a bit. E.g. remove decimals from money, reduce decimals to 1 for difficulty, etc. 
        // for (let i = 0; i < serverData.length; i++) {
        //     serverData[i][7] = ns.nFormat(serverData[i][7], "$0a"); // money available
        //     serverData[i][8] = ns.nFormat(serverData[i][8], "$0a"); // money max
        //     serverData[i][9] = ns.nFormat(serverData[i][9], "0.0a"); // hack difficulty
        //     serverData[i][10] = ns.nFormat(serverData[i][10], "0.0a"); // min difficulty
        // }

        // // now we can go trough each row in the data and store the max length of the data in each column 
        // let maxLengths = [];
        // for (let i = 0; i < serverData.length; i++) {
        //     for (let j = 0; j < serverData[i].length; j++) {
        //         if (maxLengths[j] === undefined || serverData[i][j].length > maxLengths[j]) {
        //             maxLengths[j] = serverData[i][j].length;
        //         }
        //     }
        // }

        // // now that we have the max lengths of each column, we can go through the data again and add spaces to make the data nicely formatted
        // // we can use .tofixed() and .padstart() to make sure the data is formatted correctly
        // // I like to add 2 spaces before the data with padStart(). 
        // let formattedData = [];
        // for (let i = 0; i < serverData.length; i++) {
        //     let formattedRow = '';
        //     for (let j = 0; j < serverData[i].length; j++) {
        //         formattedRow += serverData[i][j].padStart(maxLengths[j] + 2);
        //     }
        //     formattedData.push(formattedRow);
        // }

        // // print the data in a nicely formatted table
        // for (let i = 0; i < formattedData.length; i++) {
        //     ns.tprint(formattedData[i]);
        // }
    
    
    // now we can store all of that in the servers.txt file
    await ns.write(serverDataFile, JSON.stringify(serverData));
}