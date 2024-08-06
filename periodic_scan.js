/** @param {NS} ns **/

/**
 * Script runs in background, scanning the whole network every interval
 * 
 * Usage: 
 * run periodic_scan.js <interval>
 * - interval: "m" at the end means minutes, "s" at the end means seconds, no suffix means seconds
 */

export async function main(ns) {
    let interval = 60; // scanning interval in seconds. default to 60 seconds

    if (ns.args.length === 1) {
        let arg = ns.args[0];
        let lastChar = arg.charAt(arg.length - 1);
        
        // if it's a number with an m at the end, it's supposed to be in minutes
        // if it's a number with an s at the end, or just a number, it's supposed to be in seconds
        if (lastChar === 'm') {
            interval = parseInt(arg) * 60;
        } else {
            interval = parseInt(arg);
        }
    }

    ns.tprint(`Starting periodic scan with interval of ${interval} seconds`);
    while (true) {
        ns.run('scan.js', 1, 'scan', 'log'); // we pass the 'log' argument to scan.js to log the results
        await ns.sleep(interval * 1000);
    }
}