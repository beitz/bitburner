/** @param {NS} ns **/

import { readData, writeData } from 'utils/utils.js';

/**
 * This script will always run in the background, periodically executing other scripts.
 * - It will scan all servers and log the data to a file
 * - It will nuke servers when possible
 * - It will determine how to distribute available resources (RAM, etc.) and execute hacking scripts
 * - (optional) It will purchase and upgrade servers
 * 
 * Usage: 
 * run manager.js <args>
 * Args:
 * - 'u:<minutes>' to set the update interval in minutes
 * - 'm:false' to not spend money
 */

export async function main(ns) {
    // ------------------ check arguments ------------------
    if (ns.args.length === 0) { // if no arguments are passed, print help
        ns.tprint("Usage: run manager.js <args>");
        ns.tprint("Args:");
        ns.tprint("- 'u:<minutes>' to set the update interval in minutes");
        ns.tprint("- 'm:false' to not spend money");
        return;
    }

    // ------------------ variables ------------------
    const updateInterval = 1000 * 60 * (getArgValue(ns.args, "u") || 20); // get update interval in minutes. Default is 20 minutes
    const spendMoney = getArgValue(ns.args, "m") !== undefined ? getArgValue(ns.args, "m") : true; // do we spend money? Default is true
    const freeRAMonHome = 50; // gb of RAM we want to keep free on home server for other scripts
    const serversFile = "data/servers.txt";
    const hackFile = "hack.js";
    const scanFile = "scan.js";
    const budgetFactorPurchaseServers = 0.9; // we spend at most 90% of our money on servers

    // ------------------ check data and files ------------------
    // If we just started (i.e. our hacking level is 1), we remove the servers file to reset the log data
    if (ns.getHackingLevel() === 1) {
        ns.rm("data/servers_log.txt");
    }

    // Check if periodic_scan.js is running. If not, start it
    if (!ns.scriptRunning('periodic_scan.js', 'home')) {
        ns.run('periodic_scan.js', 1, '60'); // run periodic_scan.js every 60 seconds
    }

    // ------------------ main ------------------
    while (true) {
        // ------------------ variables ------------------
        let purchaseServersBudget = ns.getServerMoneyAvailable('home') * budgetFactorPurchaseServers; // we spend at most 90% of our money on servers

        // ------------------ update cycle ------------------
        scan(ns, scanFile); // scan all servers with scan.js to update the `servers.txt` file
        nukeServers(ns, serversFile); // nuke all servers
        
        // if spend money, purchase and upgrade servers
        if (spendMoney) {
            scan(ns, scanFile);
            ns.run('purchase_server.js', 1, 'buy', purchaseServersBudget); // purchase/upgrade servers
        }

        // #####################################################
        scan(ns, scanFile); // scan all servers with scan.js to update the `servers.txt` file
        hackOnPurchasedServers(ns, freeRAMonHome, hackFile, scanFile); // hack on all purchased servers
        hackOnTargetServers(ns, serversFile); // hack on target servers

        await ns.sleep(updateInterval); // wait until the next update cycle
    }
}

// ------------------ functions ------------------
function getArgValue(args, key) { // get the value of the argument key
    for (let i = 0; i < args.length; i++) {
        // if the first character of the argument is the key, return the value
        if (args[i][0] === key) {
            return args[i].split(':')[1];
        }
    }
    return null;
}

function scan(ns, scanFile) { // scan all servers
    ns.run(scanFile, 1, 'scan');
}

function nukeServers(ns, serversFile) { // nuke all servers
    const serverData = readData(ns, serversFile);
    const indexHostname = serverData[0].indexOf('hostname');
    const indexAdmin = serverData[0].indexOf('hasAdminRights');

    for (let row = 1; row < serverData.length - 1; row++) {
        if (!serverData[row][indexAdmin] && serverHackable(serverData[row][indexHostname], serverData)) { // if the server is hackable and we don't have admin rights yet
            ns.nuke(serverData[row][indexHostname]); // we nuke it
        }
    }
}

function hackOnTargetServers(ns, serversFile) { // hack on target servers
    let serverData = readData(ns, serversFile);
    let indexAdmin = serverData[0].indexOf('hasAdminRights');
    let indexPurchasedByPlayer = serverData[0].indexOf('purchasedByPlayer');
    let indexHostname = serverData[0].indexOf('hostname');
    const scriptRam = ns.getScriptRam('hack.js');

    for (let row = 1; row < serverData.length; row++) {
        if (serverData[row][indexAdmin] && !serverData[row][indexPurchasedByPlayer]) { // if we have admin rights and but the server is not purchased by us
            let server = ns.getServer(serverData[row][indexHostname]);
            let ps = ns.ps(serverData[row][indexHostname]);

            for (let p of ps) { // kill all running scripts on the server
                if (p.filename.includes('hack')) {
                    ns.kill(p.pid);
                }
            }

            // remove, then copy the hack script
            ns.rm('hack.js', serverData[row][indexHostname]);
            ns.scp('hack.js', serverData[row][indexHostname]);
            
            // calculate the amount of threads we can use and run the hack script
            let threads = Math.floor((server.maxRam - server.ramUsed) / scriptRam); 
            if (threads > 0) {
                ns.exec('hack.js', serverData[row][indexHostname], threads, serverData[row][indexHostname], threads);
            }
        }
    }
}

function hackOnPurchasedServers(ns, freeRAMonHome, hackFile, scanFile) { // hack on all purchased servers
    let script_ram = ns.getScriptRam(hackFile);
    let serverData = readData(ns, scanFile);
    let indexPurchasedByPlayer = serverData[0].indexOf('purchasedByPlayer');
    let indexMaxRam = serverData[0].indexOf('maxRam');
    let indexServerValue = serverData[0].indexOf('serverValue');
    let indexHackable = serverData[0].indexOf('hackable');
    let indexHostname = serverData[0].indexOf('hostname');
    let totalRunnableThreads = Math.floor((ns.getServerMaxRam('home') - freeRAMonHome) / script_ram); // calculate available RAM on home server

    // ------------------ calculate total runnable threads ------------------
    if (totalRunnableThreads < 0) { // just in case our home server has less than what we defined as min free RAM
        totalRunnableThreads = 0;
    }

    for (let row = 1; row < serverData.length; row++) {
        if (serverData[row][indexPurchasedByPlayer] === true) {
            totalRunnableThreads += Math.floor((serverData[row][indexMaxRam] - 0) / script_ram); // calculate available RAM on purchased servers
        }
    }

    // ------------------ calculate server value ------------------
    let toHackServersTotalValue = 0; // total value of all the servers that we want to hack
    for (let row = 1; row < serverData.length; row++) {
        toHackServersTotalValue += serverData[row][indexServerValue];
    }

    // ------------------ add server value as percentage to array ------------------
    serverData[0].push('percentageValue'); // add a new column to the header
    for (let row = 1; row < serverData.length; row++) {
        serverData[row].push(serverData[row][indexServerValue] / toHackServersTotalValue);
    }
    let indexPercentageValue = serverData[0].indexOf('percentageValue'); // get the index of the new column

    // ------------------ calculate threads for each server ------------------
    let toHackServers = serverData.slice(1).filter(server => server[indexHackable] === true); // filter out servers that are not hackable
    toHackServers.unshift(serverData[0]); // add the header back again so we can index it
    toHackServers[0].push('threads'); // add a new column to the header
    let indexThreads = toHackServers[0].indexOf('threads'); // get the index of the new column
    for (let row = 1; row < toHackServers.length; row++) {
        toHackServers[row].push(Math.floor(totalRunnableThreads * toHackServers[row][indexPercentageValue]));
    }

    // ------------------ kill running scripts ------------------
    for (let row = 1; row < serverData.length; row++) {
        if (serverData[row][indexPurchasedByPlayer] === true || serverData[row][indexHostname] === 'home') {
            let processes = ns.ps(serverData[row][indexHostname]);
            for (let process of processes) {
                if (process.filename.includes('hack')) { // kill all hacking processes
                    ns.kill(process.pid);
                }
                if (serverData[row][indexHostname] !== 'home') { // remove the hack script from all servers except 'home' anc copy a new version of it to the server
                    ns.rm(hackFile, serverData[row][indexHostname]);
                    ns.scp(hackFile, serverData[row][indexHostname]);
                }
            }
        }
    }

    // ------------------ run hack scripts ------------------
    let remainingThreads = totalRunnableThreads;
    let iH = 1; // Index to the current server we're executing hacking scripts on
    let purchasedServers = serverData.slice(1).filter(server => server[indexPurchasedByPlayer] === true); // we build a new array with only our purchased servers
    purchasedServers.unshift(serverData[0]); // we add the header to the purchasedServers array
    let iP = 1; // Index to the current purchased server we're executing hacking scripts on

    let counter = 1; // counter to prevent infinite loops, just in case we mess up something
    while (remainingThreads > 0) {
        if (iP >= purchasedServers.length || iH >= toHackServers.length) {
            // ns.tprint("Error 2052: Index exceeded array length. Breaking loop. Remaning threads: " + remainingThreads);
            // todo: figure out how to prevent this error, cause it happens all the time
            break;
        }

        // if the current purchased server has enough threads available, we run the hack script on it with the given amount of threads
        if (purchasedServers[iP][indexThreads] > toHackServers[iH][indexThreads]) {
            if (toHackServers[iH][indexThreads] > 0) { // only if threads are > 0 we run the hack script
                ns.exec(hackFile, purchasedServers[iP][indexHostname], toHackServers[iH][indexThreads], toHackServers[iH][indexHostname], toHackServers[iH][indexThreads]);
                purchasedServers[iP][indexThreads] -= toHackServers[iH][indexThreads];
                remainingThreads -= toHackServers[iH][indexThreads];
            }
            iH++; // go to the next toHackServer
        } else { // if not, we run the hack script with as many threads as possible and the next server can use the remaining threads
            if (purchasedServers[iP][indexThreads] > 0) { // only if threads are > 0 we run the hack script
                ns.exec(hackFile, purchasedServers[iP][indexHostname], purchasedServers[iP][indexThreads], toHackServers[iH][indexHostname], purchasedServers[iP][indexThreads]);
                toHackServers[iH][indexThreads] -= purchasedServers[iP][indexThreads];
                remainingThreads -= purchasedServers[iP][indexThreads];
            }
            iP++; // go to the next purchasedServer
        }
        counter++;
        if (counter > 1000 || iP >= purchasedServers.length || iH >= toHackServers.length) {
            ns.tprint("Error 2053: Counter exceeded 1000 or index exceeded array length. Breaking loop.");
            break;
        }
    }
}

function serverHackable(target, serverData) { // check if the target server is hackable
    const index_hostname = serverData[0].indexOf('hostname');
    const index_admin = serverData[0].indexOf('hasAdminRights');

    for (let i = 1; i < serverData.length - 1; i++) {
        if (serverData[i][index_hostname] === target) {
            if (serverData[i][index_admin]) {
                return true;
            } else {
                return false;
            }
        }
    }
}
