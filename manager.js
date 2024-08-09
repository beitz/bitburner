/** @param {NS} ns **/

import { readData, debugPrint } from 'utils/utils.js';

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
    const spendMoney = getArgValue(ns.args, "m") !== null ? getArgValue(ns.args, "m") : true; // do we spend money? Default is true
    const freeRAMonHome = 50; // gb of RAM we want to keep free on home server for other scripts
    const serversFile = "data/servers.txt";
    const hackFile = "hack.js";
    const scanFile = "scan.js";
    const budgetFactorPurchaseServers = 0.9; // we spend at most 90% of our money on servers
    const hackOnHome = false; // do we hack on the home server?

    // ------------------ kill previous manager.js ------------------
    killPreviousManagers(ns);

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
        // todo: solve contracts where possible. 
        
        // if spendMoney = true, purchase and upgrade servers
        if (spendMoney) {
            scan(ns, scanFile);
            ns.run('purchase_server.js', 1, 'buy', purchaseServersBudget); // purchase/upgrade servers
        }

        // #####################################################
        scan(ns, scanFile);
        hackOnTargetServers(ns, serversFile); // hack on target servers
        hackOnPurchasedServers(ns, freeRAMonHome, hackFile, serversFile, hackOnHome); // hack on all purchased servers

        scan(ns, scanFile);

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

function killPreviousManagers(ns) { // kill all previous manager.js scripts
    let processes = ns.ps('home');
    let currentManagerPID;

    // we looop through the processes on our home server from last to first. 
    // the first process with "manager" in the filename is the current script, we leave that alone. 
    // all other manager scripts will be killed
    for (let i = processes.length - 1; i >= 0; i--) {
        if (processes[i].filename.includes('manager') && !currentManagerPID) {
            currentManagerPID = processes[i].pid;
            continue;
        }
        if (processes[i].filename.includes('manager')) {
            ns.kill(processes[i].pid);
        }
    }
}

function scan(ns, scanFile) { // scan all servers
    ns.run(scanFile, 1, 'scan');
}

function nukeServers(ns, serversFile) { // nuke all servers
    const serverData = readData(ns, serversFile);
    const indexHostname = serverData[0].indexOf('hostname');
    const indexAdmin = serverData[0].indexOf('hasAdminRights');
    const indexHackable = serverData[0].indexOf('hackable');

    for (let row = 1; row < serverData.length - 1; row++) {
        if (!serverData[row][indexAdmin] && serverData[row][indexHackable]) { // if the server is hackable and we don't have admin rights yet
            openPorts(ns, serverData[row][indexHostname]); // we open the ports
            ns.nuke(serverData[row][indexHostname]); // we nuke it
        }
    }
}

function openPorts(ns, target) { // open all ports on the target server
    if (ns.fileExists('BruteSSH.exe', 'home')) ns.brutessh(target);
    if (ns.fileExists('FTPCrack.exe', 'home')) ns.ftpcrack(target);
    if (ns.fileExists('relaySMTP.exe', 'home')) ns.relaysmtp(target);
    if (ns.fileExists('HTTPWorm.exe', 'home')) ns.httpworm(target);
    if (ns.fileExists('SQLInject.exe', 'home')) ns.sqlinject(target);    
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

            // // calculate the amount of threads we can use and run the hack script
            // let threads = Math.floor((server.maxRam - server.ramUsed) / scriptRam); 
            // if (threads > 0) {
            //     ns.tprint(`executing hack.js on ${serverData[row][indexHostname]} with ${threads} threads`);
            //     ns.exec('hack.js', serverData[row][indexHostname], threads, serverData[row][indexHostname], threads);
            // }
        }
    }

    for (let row = 1; row < serverData.length; row++) {
        if (serverData[row][indexAdmin] && !serverData[row][indexPurchasedByPlayer]) {
            // NOTE: this loop has been separated to deal with the issue that the server.ramUsed is apparently not updated otherwise. This way this works for some reason. 
            let server = ns.getServer(serverData[row][indexHostname]);

            // calculate the amount of threads we can use and run the hack script
            let threads = Math.floor((server.maxRam - server.ramUsed) / scriptRam); 
            if (threads > 0) {
                ns.exec('hack.js', serverData[row][indexHostname], threads, serverData[row][indexHostname], threads);
            }
        }
    }
}

function hackOnPurchasedServers(ns, freeRAMonHome, hackFile, serversFile, hackOnHome) { // hack on all purchased servers
    let script_ram = ns.getScriptRam(hackFile);
    let serverData = readData(ns, serversFile);
    let indexPurchasedByPlayer = serverData[0].indexOf('purchasedByPlayer');
    let indexMaxRam = serverData[0].indexOf('maxRam');
    let indexServerValue = serverData[0].indexOf('serverValue');
    let indexHackable = serverData[0].indexOf('hackable');
    let indexHostname = serverData[0].indexOf('hostname');
    let totalRunnableThreads = Math.floor((ns.getServerMaxRam('home') - freeRAMonHome) / script_ram); // calculate available RAM on home server
    
    // ------------------ calculate total runnable threads ------------------
    if (!hackOnHome) totalRunnableThreads = 0; // if we don't want to hack on the home server, we set the threads to 0 instead
    if (totalRunnableThreads < 0) { // just in case our home server has less than what we defined as min free RAM
        totalRunnableThreads = 0;
    }

    for (let row = 1; row < serverData.length - 1; row++) {
        if (serverData[row][indexPurchasedByPlayer] === true) {
            totalRunnableThreads += Math.floor((serverData[row][indexMaxRam] - 0) / script_ram); // calculate available RAM on purchased servers
        }
    }
    
    // ------------------ calculate server value and threads ------------------
    serverData[0].push('percentageValue'); // add a new column to the header
    serverData[0].push('threads'); // add a new column to the header
    let indexPercentageValue = serverData[0].indexOf('percentageValue'); // get the index of the new column
    let indexThreads = serverData[0].indexOf('threads'); // get the index of the new column
    let toHackServersTotalValue = 0; // total value of all the servers that we want to hack

    // first we calculate the total value of all the servers that we want to hack
    for (let row = 1; row < serverData.length - 1; row++) {
        if (serverData[row][indexHackable] === true) {
            toHackServersTotalValue += serverData[row][indexServerValue];
        }
    }

    // then we add the percentage value
    for (let row = 1; row < serverData.length - 1; row++) {
        // we don't need to exclude purchased servers, as they have a value of 0 by default
        serverData[row].push(serverData[row][indexServerValue] / toHackServersTotalValue);
    }

    // then the threads for servers we want to hack
    for (let row = 1; row < serverData.length - 1; row++) {
        serverData[row].push(Math.floor(totalRunnableThreads * serverData[row][indexPercentageValue]));
    }

    // finally the threads for our purchased servers
    for (let row = 1; row < serverData.length - 1; row++) {
        if (serverData[row][indexPurchasedByPlayer] === true) {
            serverData[row][indexThreads] = Math.floor((serverData[row][indexMaxRam]) / script_ram);
        }
    }

    // ------------------ kill running scripts on purchased servers ------------------
    for (let row = 1; row < serverData.length - 1; row++) {
        if (serverData[row][indexPurchasedByPlayer] === true && serverData[row][indexHostname] !== 'home') {
            let processes = ns.ps(serverData[row][indexHostname]);
            for (let process of processes) {
                if (process.filename.includes('hack')) { // kill all hacking processes
                    ns.kill(process.pid);
                }
            }
            ns.rm(hackFile, serverData[row][indexHostname]);
            ns.scp(hackFile, serverData[row][indexHostname]);
        }
    }

    // ------------------ kill running scripts on home ------------------
    for (let row = 1; row < serverData.length - 1; row++) {
        if (serverData[row][indexHostname] === 'home' && hackOnHome) {
            let processes = ns.ps(serverData[row][indexHostname]);
            for (let process of processes) {
                if (process.filename.includes('hack')) { // kill all hacking processes
                    ns.kill(process.pid);
                }
            }
            break;
        }
    }

    // ------------------ run hack scripts ------------------
    let remainingThreads = totalRunnableThreads;
    let toHackServers = serverData.slice(1).filter(server => server[indexHackable] === true); // filter out servers that are not hackable
    let iH = 1; // Index to the current server we're executing hacking scripts on
    toHackServers.unshift(serverData[0]); // we add the header to the toHackServers array
    let purchasedServers = serverData.slice(1).filter(server => server[indexPurchasedByPlayer] === true); // we build a new array with only our purchased servers
    let iP = 1; // Index to the current purchased server we're executing hacking scripts on
    purchasedServers.unshift(serverData[0]); // we add the header to the purchasedServers array
    
    // if hackOnHome is false, we remove the 'home' server from the array
    if (!hackOnHome) {
        purchasedServers = purchasedServers.filter(server => server[indexHostname] !== 'home');
    }

    let total = 0;
    for (let row = 1; row < toHackServers.length; row++) {
        total += toHackServers[row][indexPercentageValue];
    }

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
            // ns.tprint("Error 2053: Counter exceeded 1000 or index exceeded array length. Breaking loop.");
            // todo: figure out how to prevent this error, cause it happens all the time
            break;
        }
    }
}
