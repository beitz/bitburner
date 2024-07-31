/** @param {NS} ns **/

export async function main(ns) {
    // let's just print out the max ram of purchased servers and the total amount of servers we can purchase
    ns.tprint(`Max ram of purchased servers: ${ns.getPurchasedServerMaxRam()}`);
    ns.tprint(`Max servers we can purchase: ${ns.getPurchasedServerLimit()}`);

    // just for fun, let's see how expensive one server with max ram would be. convert this to this format 50,000,000 -> 5e7
    ns.tprint(`Cost of a server with max ram: ${ns.getPurchasedServerCost(ns.getPurchasedServerMaxRam()).toExponential()}`);


    let server = ns.getServer('home');
    let availableMoney = ns.getServerMoneyAvailable('home');
    ns.tprint(`Available money on home server: ${availableMoney}`);
}
