/** @param {NS} ns */

// script that manages everything else
// - should manage what kind of servers to hack and with how many threads
//   use hackAnalyzeThreads() to determine the optimal number of threads
// - should manage our money and the buying of hacknet nodes or additional servers
// - should manage files on our and other servers
// - should use scan.js to scan servers and get info on them
// - should periodically log cool stats for us, like our money and maybe server stats of currently being hacked servers
// - for the future, run several scripts and manage timing. E.g. run script for lowering security to min and money to max, 
//   then analyze server, then run hack, weaken and grow scripts with optimal number of threads to maximize profit.
// - also use ns.exec() to run scripts on other servers.

// periodically get all necessary data like current money, money on servers, etc. and log it
// then determine with some fancy logic what to do and what scripts to run
// take care not to use anything that requires await, as it might mess with the timing. 
// let's maybe scan periodically like every second or every minute or so. Depends on how much data we can sensibly work with and how large the log file will get once we can recursively scan the whole fucking network. 

// todo: implement lots of functions from hack_all.js script in here. I want to manage everthing with this script here. 

// todo: actually, changed my mind. Discard everything before this comment. This script will not run periodically, but only once with different arguments. 
// arguments:
//   (no arguments): prints help with argument descriptions and some general statistics and data
//   nuke: nukes all servers (also opens ports and installs backdoors etc.)
//   nuke target: nukes just the target server
//   hack: hacks all servers
//   hack target: hacks the target server
//   hack target threads: hacks the target server with the given amount of threads
//   kill: kills all scripts on all servers
//   kill target: kills all scripts on target server
//   scan: scans all servers and prints content on terminal

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
    // ------------------ variables ------------------
    const updateInterval = 1000 * 60 * 60; // 5 minutes. interval for updating data
    const restartHackInterval = 1000 * 60 * 60; // 1 hour. interval for killing and restarting hacking scripts
    // todo: implement the restart hack interval. The idea is that I check every 5 minutes and start new hacking scripts wherever there is a newly hackable server with free RAM.
    //       Only once an hour or so I kill all running hacking scripts and restart them to distribute the threads hopefully more cleverly. 
    let restartTimer = Date.now(); // initialize restart timer // todo: implement restart timer
    const hack_file = "hack_simple_3.js"; // usage: execute with ns.exec(script, target, threads, arg1, arg2, ...)
    const servers_file = "data/servers_current.txt";
    const script_ram = ns.getScriptRam(hack_file); // ram usage of the hack script
    // available columns: let serverDataHeader = [['date time', 'pos.', 'scanned', 'hostname', 'hasAdminRights', 'numOpenPortsRequired', 'maxRam', 'ramUsed', 
    // 'purchasedByPlayer', 'moneyAvailable', 'moneyMax', 'hackDifficulty', 
    // 'minDifficulty', 'currentHackingLevel', 'requiredHackingSkill', 'depth', 'files', 'hackable', 'serverGrowth', 'Cores', 'moneyPercent', 'serverValue']];

    // check if periodic_scan.js is running. if not, start it
    if (!ns.scriptRunning('periodic_scan.js', 'home')) {
        ns.run('periodic_scan.js');
    }

    while (true) {
        // ------------------ update cycle ------------------
        // we run all scripts that provide us with the data we need

        ns.run('scan.js'); // scan all servers with scan.js to update the `servers_current.txt` file
        await ns.sleep(10); // wait for scan.js to finish
        ns.exec("hack_all.js", "home", 1, "nuke"); // nuke all servers
        await ns.sleep(10); // wait for scan.js to finish
        ns.run('scan.js'); // scan all servers again to see if we have any new hackable servers
        await ns.sleep(10); // wait for scan.js to finish
        
        ns.run('purchase_server.js', 1, 'purchase'); // purchase servers
        ns.run('purchase_server.js', 1, 'upgrade'); // upgrade servers

        let serverData = readData(ns, servers_file); // 2d array that will hold all the server data
        // get the indexes of the following column headers so we can address them by name

        let index_hostname = serverData[0].indexOf('hostname');
        let index_purchasedByPlayer = serverData[0].indexOf('purchasedByPlayer');
        let index_hackable = serverData[0].indexOf('hackable');
        let index_serverValue = serverData[0].indexOf('serverValue');
        let index_maxRam = serverData[0].indexOf('maxRam');

        // ------------------ do some logic and execute scripts to start hacking from our purchased servers ------------------

        // let's go add up all the ram that we have available to us first on our home server (-20 gb for other random scripts) and all the purchased servers
        let totalRunnableThreads = Math.floor((ns.getServerMaxRam('home') - 24) / script_ram); // 24 gb for other random scripts
        for (let i = 1; i < serverData.length; i++) {
            // we divide the available ram on the server by the ram required of the hack script and floor the value. 
            // this is to prevent us calculating with the unusable, tiny last portion of ram on each server
            if (serverData[i][index_purchasedByPlayer] === true) {
                totalRunnableThreads += Math.floor((serverData[i][index_maxRam] - 0) / script_ram); // 0 gb for other random scripts reserved
            }
        }

        // we take the top 10 most valuable servers and assign the value as a percentage of the total value of those top 10 servers to a new column
        // to do this we first sum the total value of those top 10 servers
        let toHackServersTotalValue = 0; // total value of all the servers that we want to hack
        // we first discard all servers that are not hackable
        let toHackServers = serverData.slice(1).filter(server => server[index_hackable] === true);
        for (let i = 0; i < toHackServers.length; i++) {
            toHackServersTotalValue += toHackServers[i][index_serverValue];
        }
        // now we can add the percentage value to the toHackServers array in a new column
        for (let i = 0; i < toHackServers.length; i++) {
            toHackServers[i].push(toHackServers[i][index_serverValue] / toHackServersTotalValue);
        }
        toHackServers.unshift(serverData[0]); // we should probably add the header back again so we can index it. we can copy it from the serverData array
        toHackServers[0].push('percentageValue'); // now we add the new column to the end of the header
        let index_percentageValue = toHackServers[0].indexOf('percentageValue'); // now we have the index of the new column
        // now we have the top 10 servers and their percentage value in the toHackServers array

        // we now know the total runnable threads and the top 10 servers and their percentage value how we want to distribute the threads
        // let's go and distribute the threads using math.floor() on the threads just in case
        toHackServers[0].push('threads'); // add a new column to the header
        let index_threads = toHackServers[0].indexOf('threads'); // get the index of the new column
        for (let i = 1; i < toHackServers.length; i++) {
            toHackServers[i].push(Math.floor(totalRunnableThreads * toHackServers[i][index_percentageValue]));
        }

        // now we need to kill all running hack scripts. 
        // We specifically include only hack scripts so that periodic_scan.js and other such scripts are not killed

        // for each server, if it is 'home' or a purchased server
        //   we get a list of all processes using ns.ps()
        //   if the process file name includes "hack" we kill it with ns.kill()
        for (let i = 1; i < serverData.length; i++) {
            if (serverData[i][index_purchasedByPlayer] === 'true' || serverData[i][index_hostname] === 'home') {
                let processes = ns.ps(serverData[i][index_hostname]);
                // ns.tprint(`proccesses on server ${serverData[i][index_hostname]}: ${processes}`);
                for (let j = 0; j < processes.length; j++) {
                    if (processes[j].filename.includes('hack')) {
                        ns.kill(processes[j].pid);
                    }
                }
            }
        }

        // now we can run the hack scripts on the servers
        // we iterate through all the purchased servers as well as 'home'

        let totalThreads = 0; // total threads that we have to distribute over the servers
        for (let i = 1; i < toHackServers.length; i++) {
            totalThreads += toHackServers[i][index_threads];
        }

        // now we can start running the hacking scripts on the servers
        // we start with 'home' and then iterate through the purchased servers
        let remainingThreads = totalThreads;
        let i_h = toHackServers.length - 1; // start with the last server. index of the toHackServers array
        let purchasedServers = serverData.slice(1).filter(server => server[index_purchasedByPlayer] === true); // we build a new array with only our purchased servers
        let i_p = 1; // start with 'home'. index of the purchasedServers array

        // we add the header to the purchasedServers array
        purchasedServers.unshift(serverData[0]);

        // we go through all the purchased servers and calculate how many threads they could run depending on the script ram and their available ram
        let indexThreadsPurchasedServers = purchasedServers[0].indexOf('threads'); // get the index of the new column
        for (let i = 1; i < purchasedServers.length; i++) {
            purchasedServers[i].push(''); // add a new column to the end of the array for percentageValue
            purchasedServers[i].push(Math.floor((purchasedServers[i][index_maxRam] - 0) / script_ram)); // 0 gb for other random scripts reserved

            // while we're at it, let's remove the hack script from the server and copy a new version of it to the server
            // skip 'home' as we don't want to remove the hack script from there
            if (purchasedServers[i][index_hostname] !== 'home') {
                ns.rm(hack_file, purchasedServers[i][index_hostname]);
                ns.scp(hack_file, purchasedServers[i][index_hostname]);
            }
        }

        let counter = 1; // counter to prevent infinite loops
        while (remainingThreads > 0) {
            // if the current purchased server has enough threads available, we run the hack script on it with the given amount of threads
            // if not, we run the hack script with as many threads as possible and the next server can use the remaining threads
            if (purchasedServers[i_p][indexThreadsPurchasedServers] > toHackServers[i_h][index_threads]) {
                if (toHackServers[i_h][index_threads] > 0) { // only if threads are > 0 we run the hack script
                    // ns.tprint(`running hack script on ${purchasedServers[i_p][index_hostname]} with ${toHackServers[i_h][index_threads]} threads on ${toHackServers[i_h][index_hostname]}`);
                    ns.exec(hack_file, purchasedServers[i_p][index_hostname], toHackServers[i_h][index_threads], toHackServers[i_h][index_threads], toHackServers[i_h][index_hostname]);
                    purchasedServers[i_p][indexThreadsPurchasedServers] -= toHackServers[i_h][index_threads];
                    remainingThreads -= toHackServers[i_h][index_threads];
                }
                i_h--; // go to the next toHackServer
            } else {
                if (purchasedServers[i_p][indexThreadsPurchasedServers] > 0) { // only if threads are > 0 we run the hack script
                    // ns.tprint(`running hack script on ${purchasedServers[i_p][index_hostname]} with ${toHackServers[i_h][index_threads]} threads on ${toHackServers[i_h][index_hostname]}`);
                    ns.exec(hack_file, purchasedServers[i_p][index_hostname], purchasedServers[i_p][indexThreadsPurchasedServers], purchasedServers[i_p][indexThreadsPurchasedServers], toHackServers[i_h][index_hostname]);
                    toHackServers[i_h][index_threads] -= purchasedServers[i_p][indexThreadsPurchasedServers];
                    remainingThreads -= purchasedServers[i_p][indexThreadsPurchasedServers];
                }
                i_p++; // go to the next purchasedServer
            }
            counter++;
            if (counter > 1000) {
                ns.tprint("counter exceeded 1000. breaking loop");
                break;
            }
            // todo: figure out why we have a little bit left over. starting with what 300.000 + threads we get to the point where we break with 1438 left. 
            //       I'm guessing it's a rounding error or something like that. This here should be good enough for now. 
            if (i_p >= purchasedServers.length) {
                // ns.tprint("i_p exceeded purchasedServers.length. breaking loop. remaining threads: " + remainingThreads);
                break;
            }
        }

        // ------------------ also run hack_all.js ----------------
        ns.exec("hack_all.js", "home", 1, "nuke"); // nuke all servers
        await ns.sleep(100); // wait for nuke to finish, just in case. I'm not sure we actually need it
        ns.exec("hack_all.js", "home", 1, "hack"); // hack all servers
        await ns.sleep(500); // wait a bit ...
        ns.exec("hack_all.js", "home", 1, "hack"); // ... and do it again. Sometimes it seems it only worked after the second time. In any case, this should not hurt. 

        await ns.sleep(updateInterval); // wait until the next update cycle
    }
}