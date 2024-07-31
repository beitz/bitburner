/** @param {NS} ns **/

// script used to purchase servers

// available functions:
// getPurchasedServerCost(ram)	Get cost of purchasing a server.
// getPurchasedServerLimit()	Returns the maximum number of servers you can purchase.
// getPurchasedServerMaxRam()	Returns the maximum RAM that a purchased server can have.
// getPurchasedServers()	Returns an array with the hostnames of all of the servers you have purchased.
// getPurchasedServerUpgradeCost(hostname, ram)	Get cost of upgrading a purchased server to the given ram.
// purchaseServer(hostname, ram)	Purchase a server.
// renamePurchasedServer(hostname, newName)	Rename a purchased server.
// upgradePurchasedServer(hostname, ram)	Upgrade a purchased server's RAM.

// todo: first buy until we have max servers, then upgrade all servers to max ram
//       rewrite this script to automatically do this so we can just call it periodically to get fully upgraded servers eventually

export async function main(ns) {
    // ------------------ functions ------------------
    function readData(file) { // function to read the data from a file
        let serverData = [];
        const data = ns.read(file);

        for (let line of data.split('\n')) {
            serverData.push(line.split('|').map(parseValue));
        }

        return serverData;
    }

    function parseValue(value) { // function to parse the value to the correct type
        // Try to parse as float
        if (!isNaN(value) && value.trim() !== '') {
            return parseFloat(value);
        }
        // Check for boolean values
        if (value.toLowerCase() === 'true') {
            return true;
        }
        if (value.toLowerCase() === 'false') {
            return false;
        }
        // Return the original string if no conversion is possible
        return value;
    }

    // ------------------ variables ------------------
    // const file = "data/servers_current.txt";
    // let serverData = await readData(file);

    if (ns.args.length === 0) {
        ns.tprint("Usage: run purchase_server.js <args>");
        ns.tprint("Args:");
        ns.tprint("- 'list' to list all servers and max servers we can own");
        ns.tprint("- 'purchase' to purchase servers");
        ns.tprint("- 'upgrade' to upgrade servers");
        return;
    }

    // get index of the following column headers: 'hostname', 'maxRam', 'purchasedByPlayer'
    // let index_hostname = serverData[0].indexOf('hostname');
    // let index_maxRam = serverData[0].indexOf('maxRam');
    // let index_purchasedByPlayer = serverData[0].indexOf('purchasedByPlayer');
    // let index_usedRam = serverData[0].indexOf('ramUsed');
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
            ns.tprint("Already at max servers");
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
                    ns.tprint(`Bought: ${purchasedServerPrefix}${currentServers} with ${purchaseRAM} RAM for ${cost}`);
                    budget -= cost;
                    currentServers++;
                    break;
                }
                purchaseRAM /= 2;
            }
        }
    } else if (ns.args[0] === 'upgrade') {
        // todo: upgrade all servers to the max ram we can buy
        //       maybe also use factor for money to only spenx x% of our money
    } else {
        ns.tprint("Usage: run purchase_server.js <args>");
        ns.tprint("Args:");
        ns.tprint("- 'list' to list all servers and max servers we can own");
        ns.tprint("- 'purchase' to purchase servers");
    }
}
