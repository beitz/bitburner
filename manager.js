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

const updateInterval = 1000 * 60; // 1 minute

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

export async function main(ns) {
    // ------------------ variables ------------------
    let scriptRam; // 
    // todo: add variables for all the stuff we need to manage











    // old stuff
    // while (true) {
    //     // ------------------ update cycle ------------------
    //     // we run all scripts that provide us with the data we need

    //     // scan all servers with scan.js
    //     ns.run('scan.js');

    //     await ns.sleep(1000); // we wait a second, just in case

    //     // ------------------ read cycle ------------------
    //     // we read the data from the text files into variables, so we can use them. 

    //     const data = await ns.read("servers.txt");
    //     const serverData = JSON.parse(data);

    //     await ns.sleep(1000); // we wait a second, just in case

    //     // ------------------ run stuff based on data ------------------



    //     // await ns.sleep(1000); // give the script some time before I try to access the file servers.txt
    //     // looks like we don't need it after all. Maybe it's the "await ns.read()" that synchronizes the scripts? 

    //     // // Read the result from the file
    //     // const data = await ns.read("servers.txt");
    //     // const servers = JSON.parse(data);

    //     // ns.tprint("servers connected to 'home':");
    //     // ns.tprint(servers);

    //     await ns.sleep(1000 * 60 * 1); // sleep for 1 minute
    // }
}