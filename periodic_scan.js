/** @param {NS} ns **/

// script that just executes the scan.js script every x seconds to populate the log file

export async function main(ns) {
    while (true) {
        ns.run('scan.js');
        await ns.sleep(5 * 1000);
    }
}
