/** @param {NS} ns **/

/**
 * This script is used to purchase and upgrade servers.
 * 
 * Usage: 
 * run purchase_server.js buy <budget>
 * budget: optional - the amount of money we're willing to spend on purchasing servers. default is all of our money.
 */

export async function main(ns) {
    // ------------------ variables ------------------
    if (ns.args.length === 0) {
        ns.tprint("Usage: run purchase_server.js buy <budget>");
        ns.tprint("budget: optional - the amount of money we're willing to spend on purchasing servers. default is all of our money.");
        return;
    } else if (ns.args.length > 2) {
        ns.tprint("Error 2476: Too many arguments");
        return;
    }
    if (ns.args[0] !== 'buy') {
        ns.tprint("Error 2477: wrong argument");
        return;
    }

    let minRam = 128; // smallest server we will allow to be bought
    let budget = ns.args[1] || ns.getServerMoneyAvailable('home');
    const purchasedServerPrefix = 'purchased-server-';
    
    // ------------------ main ------------------
    budget = purchaseServers(ns, budget, minRam, purchasedServerPrefix);

    budget = upgradeServers(ns, budget, minRam);
}

function purchaseServers(ns, budget, minRam, purchasedServerPrefix) { // function to purchase servers. returns the remaining budget
    let maxRam = ns.getPurchasedServerMaxRam(); // maximum ram we can buy
    let minCost = ns.getPurchasedServerCost(minRam); // cost of the smallest server
    let purchasedServers = ns.getPurchasedServers();
    
    // ------------------ main ------------------
    let purchaseRam = maxRam; // the amount of RAM we attempt to purchase

    while (budget > minCost) { // we try to buy as many servers as we can
        if (purchasedServers.length >= ns.getPurchasedServerLimit()) { // we can't buy more servers
            break;
        }

        while (purchaseRam >= minRam) { // we try to buy the biggest server we can
            let cost = ns.getPurchasedServerCost(purchaseRam);
            if (cost <= budget) {
                ns.purchaseServer(purchasedServerPrefix + purchasedServers.length, purchaseRam);
                budget -= cost;
                break;
            }
            purchaseRam /= 2;
        }
    }

    return budget;
}

function upgradeServers(ns, budget, minRam) { // function to upgrade servers. returns the remaining budget
    let maxRam = ns.getPurchasedServerMaxRam(); // maximum ram we can buy
    let upgradeRam = maxRam; // the amount of RAM we attempt to upgrade to
    let purchasedServers = ns.getPurchasedServers();

    for (let i = 0; i < purchasedServers.length; i++) { // we try to upgrade all servers
        let server = ns.getServer(purchasedServers[i]);
        let currentRam = server.maxRam;
        if (currentRam === maxRam) { // we can skip servers that are already at max ram
            continue;
        }
        let upgradeCost = ns.getPurchasedServerUpgradeCost(server.hostname, maxRam);

        while (upgradeCost > budget && upgradeRam > minRam) { // find the biggest upgrade we can afford
            upgradeRam /= 2;
            upgradeCost = ns.getPurchasedServerUpgradeCost(server.hostname, upgradeRam);
        }

        if (upgradeCost <= budget && upgradeRam > currentRam) {
            ns.upgradePurchasedServer(server.hostname, upgradeRam);
            budget -= upgradeCost;
        }
    }

    return budget;
}