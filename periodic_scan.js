/** @param {NS} ns **/

// script that just executes the scan.js script every x seconds to populate the log file

export async function main(ns) {
    let interval; // scanning interval in seconds

    // trying to interpret the argument
    // if it's a number with an s at the end, it's supposed to be in seconds
    // if its a number with an m at the end, it's supposed to be in minutes
    // if its just a number, use it as seconds
    if (ns.args.length = 1) {
        let arg = ns.args[0];
        if (arg.endsWith('s')) {
            interval = parseInt(arg);
        } else if (arg.endsWith('m')) {
            interval = parseInt(arg) * 60;
        } else {
            interval = parseInt(arg);
        }
    } else {
        // if no argument is given, default to 60 seconds
        interval = 60;
    }

    ns.tprint(`Starting periodic scan with interval of ${interval} seconds`);
    while (true) {
        ns.run('scan.js');
        await ns.sleep(interval * 1000);
    }
}
