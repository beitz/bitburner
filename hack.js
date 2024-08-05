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
    let phase = 0; // phase of the script. 0 = reducing security, 1 = growing, 3 = hacking

    // ------------------ main ------------------
    // we check in which phase we are and execute the corresponding code

    while (phase < 3) {
        switch (phase) {
            case 0:
                if (await reduceSecurity(ns, target)) phase++;
            case 1:
                if (await growServer(ns, target)) phase++;
            case 2:
                await hackServer(ns, target, moneyThreshold, securityThreshold, threads);
        }
    }
    ns.tprint("Error 5023: Should not reach this point");
}

// ------------------ functions ------------------
function updateServerInfo(ns, target) { // returns the [current money available, max money, current security level, min security level] of the target server
    let moneyAvailable = ns.getServerMoneyAvailable(target);
    let maxMoney = ns.getServerMaxMoney(target);
    let securityLevel = ns.getServerSecurityLevel(target);
    let minSecurityLevel = ns.getServerMinSecurityLevel(target);
    return [moneyAvailable, maxMoney, securityLevel, minSecurityLevel];
}

async function reduceSecurity(ns, target) { // function to reduce the security level of target server to the minimum
    // returns true if the security level is reached, false otherwise

    const [moneyAvailable, maxMoney, securityLevel, minSecurityLevel] = updateServerInfo(ns, target);
    if (securityLevel > minSecurityLevel) {
        await ns.weaken(target);
        return false;
    } else {
        return true;
    }
}

async function growServer(ns, target) { // function to grow the money on the target server to the max
    // returns true if the money is maxed out, false otherwise

    const [moneyAvailable, maxMoney, securityLevel, minSecurityLevel] = updateServerInfo(ns, target);
    if (moneyAvailable < maxMoney) {
        await ns.grow(target);
        return false;
    } else {
        return true;
    }
}

async function hackServer(ns, target, moneyThreshold, securityThreshold, threads) { // function to hack the target server
    const [moneyAvailable, maxMoney, securityLevel, minSecurityLevel] = updateServerInfo(ns, target);
    if (securityLevel > minSecurityLevel + (securityThreshold * threads)) {
        await ns.weaken(target);
    } else if (moneyAvailable < maxMoney * (1 - moneyThreshold) ** threads) {
        await ns.grow(target);
    } else {
        await ns.hack(target);
    }
}