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
    const file = "data/servers_current.txt";
    let serverData = await readData(file);

    if (ns.args.length === 0) {
        ns.tprint("Usage: run purchase_server.js <args>");
        ns.tprint("Args:");
        ns.tprint("- 'list' to list all servers and max servers we can own");
        ns.tprint("- 'purchase' to purchase servers");
        ns.tprint("- 'upgrade' to upgrade servers");
        return;
    }

    // get index of the following column headers: 'hostname', 'maxRam', 'purchasedByPlayer'
    let index_hostname = serverData[0].indexOf('hostname');
    let index_maxRam = serverData[0].indexOf('maxRam');
    let index_purchasedByPlayer = serverData[0].indexOf('purchasedByPlayer');

    // ------------------ main ------------------
    if (ns.args[0] === 'list') {
        for (let i = 1; i < serverData.length; i++) {
            if (serverData[i][index_purchasedByPlayer] === 'true') {
                ns.tprint(`${serverData[i][index_hostname]}: ${serverData[i][index_maxRam]}`);
            }
        }
    } else if (ns.args[0] === 'purchase') {
        // todo: figure out the biggest server we can buy and buy it

        


    } else if (ns.args[0] === 'upgrade') {
        // todo: upgrade all servers to the max ram we can buy
    } else {
        ns.tprint("Usage: run purchase_server.js <args>");
        ns.tprint("Args:");
        ns.tprint("- 'list' to list all servers and max servers we can own");
        ns.tprint("- 'purchase' to purchase servers");
    }
}
