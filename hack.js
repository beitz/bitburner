/** @param {NS} ns */

/**
 * This script is used to hack a specific server.
 * 
 * Usage: 
 * run hack.js <target> (threads)
 * target: target server to hack
 * threads: optional - number of threads we're using. Default is 1.
 */

export async function main(ns) {
    // ------------------ check arguments ------------------
    if (ns.args.length < 1) {
        ns.tprint("Usage: run hack.js <target> (threads)");
        ns.tprint("<target> = target server to hack");
        ns.tprint("(threads) = optional: number of threads we're using. Default is 1.");
        return;
    } else if (ns.args.length > 2) {
        ns.tprint("Error 781: Too many arguments");
        return;
    }

    // ------------------ variables ------------------
    const target = ns.args[0];
    const threads = ns.args[1] || 1;
    const securityThreshold = 0.05; // When the security is this much above the server minimum, we weaken the server again.
    const moneyThreshold = 0.9; // The threshold (available money / max money on server) at which we will hack the server.

    // ------------------ main ------------------
    while (true) {
        await hackServer(ns, target, moneyThreshold, securityThreshold, threads);
    }
}

// ------------------ functions ------------------
function updateServerInfo(ns, target) { // returns the [current money available, max money, current security level, min security level] of the target server
    let moneyAvailable = ns.getServerMoneyAvailable(target);
    let maxMoney = ns.getServerMaxMoney(target);
    let securityLevel = ns.getServerSecurityLevel(target);
    let minSecurityLevel = ns.getServerMinSecurityLevel(target);
    return [moneyAvailable, maxMoney, securityLevel, minSecurityLevel];
}

async function hackServer(ns, target, moneyThreshold, securityThreshold, threads) { // function to hack the target server
    const [moneyAvailable, maxMoney, securityLevel, minSecurityLevel] = updateServerInfo(ns, target);
    if (securityLevel > minSecurityLevel + (securityThreshold * threads)) {
        await ns.weaken(target);
    } else if (moneyAvailable < maxMoney * moneyThreshold) {
        await ns.grow(target);
    } else {
        await ns.hack(target);
    }
}