/** @param {NS} ns **/

// script used to purchase servers

// todo: first buy until we have max servers, then upgrade all servers to max ram
//       rewrite this script to automatically do this so we can just call it periodically to get fully upgraded servers eventually

export async function main(ns) {
    // ------------------ variables ------------------
    if (ns.args.length === 0) {
        ns.tprint("Usage: run purchase_server.js <args>");
        ns.tprint("Args:");
        ns.tprint("- 'list' to list all servers and max servers we can own");
        ns.tprint("- 'purchase' to purchase servers");
        ns.tprint("- 'upgrade' to upgrade servers");
        return;
    }

    let purchasedServers = ns.getPurchasedServers();
    let purchasedServerPrefix = 'purchased-server-';

    // ------------------ main ------------------
    if (ns.args[0] === 'list') { // list our purchased servers: name, max ram, used ram
        for (let i = 0; i < purchasedServers.length; i++) {
            let server = ns.getServer(purchasedServers[i]);
            ns.tprint(`${server.hostname}: ${server.ramUsed}/${server.maxRam}`);
        }
    } else if (ns.args[0] === 'purchase') {
        // todo: figure out the biggest server we can buy and buy it
        let maxServers = ns.getPurchasedServerLimit();
        let currentServers = purchasedServers.length;
        if (currentServers >= maxServers) {
            // ns.tprint("Already at max servers");
            return;
        }

        let moneySpendFactor = ns.args[1] || 0.9; // by default we spend 90% of our money to make sure we have at least some left
        let availableMoney = ns.getServerMoneyAvailable('home');
        let budget = availableMoney * moneySpendFactor;
        let maxRam = ns.getPurchasedServerMaxRam(); // should always be a factor of 2
        let minRam = 128; // smallest server we will allow to be bought
        let purchaseRAM = maxRam; // the amount of RAM we attempt to purchase
        let minCost = ns.getPurchasedServerCost(minRam); // smallest server we will buy will be 4 gb

        while (budget > minCost) { // we try to buy as many servers as we can
            while (purchaseRAM >= minRam) { // we try to buy the biggest server we can
                let cost = ns.getPurchasedServerCost(purchaseRAM);
                if (cost <= budget) {
                    ns.purchaseServer(purchasedServerPrefix + currentServers, purchaseRAM);
                    // ns.tprint(`Bought: ${purchasedServerPrefix}${currentServers} with ${purchaseRAM} RAM for ${cost}`);
                    budget -= cost;
                    currentServers++;
                    break;
                }
                purchaseRAM /= 2;
            }
        }
    } else if (ns.args[0] === 'upgrade') {
        let upgradeBudget = ns.getServerMoneyAvailable('home') * 0.9; // we spend at most 90% of our money on upgrades
        let maxRam = ns.getPurchasedServerMaxRam();
        let upgradeRam = maxRam;

        for (let i = 0; i < purchasedServers.length; i++) {
            let server = ns.getServer(purchasedServers[i]);
            let currentRam = server.maxRam;
            if (currentRam === maxRam) { // we can skip servers that are already at max ram
                continue;
            }
            let upgradeCost = ns.getPurchasedServerUpgradeCost(server.hostname, maxRam);

            // ns.tprint(`server: ${server.hostname}, current ram: ${currentRam}, upgrade cost: ${upgradeCost}, upgrade budget: ${upgradeBudget}`);
            
            // a few scenarios:
            // 1. we have enough budget to upgrade the server to max. so we do. 
            // 2. we don't have enough budget. so we go into a loop and try again with 1/2 ram until we can upgrade or we reach the minimum ram
            while (upgradeCost > upgradeBudget && upgradeRam > 128) {
                upgradeRam /= 2;
                upgradeCost = ns.getPurchasedServerUpgradeCost(server.hostname, currentRam);
                // ns.tprint(`reducing upgrade ram to ${upgradeRam} and cost to ${upgradeCost}`);
            }
            if (upgradeCost <= upgradeBudget && upgradeRam > currentRam) {
                ns.upgradePurchasedServer(server.hostname, upgradeRam);
                // ns.tprint(`Upgraded: ${server.hostname} to ${upgradeRam} RAM for ${upgradeCost}`);
                upgradeBudget -= upgradeCost;
            }
        }
    } else {
        ns.tprint("Usage: run purchase_server.js <args>");
        ns.tprint("Args:");
        ns.tprint("- 'list' to list all servers and max servers we can own");
        ns.tprint("- 'purchase' to purchase servers");
    }
}
