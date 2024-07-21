/** @param {NS} ns */

// script that scans all servers recursively and prints all kinds of stuff to the terminal

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
        await ns.write(serverDataFile, JSON.stringify(serverData));
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

    // now we can store all of that in the servers.txt file
    await ns.write(serverDataFile, JSON.stringify(serverData));
}