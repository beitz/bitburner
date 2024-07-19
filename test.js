/** @param {NS} ns */
export async function main(ns) {
    // first argument is the target server
    // check if we only have one argument. if yes, execute code, if not return help to terminal
    // this function will print to the terminal the maximum money on the server, the min security level and other useful information

    if (ns.args.length == 1) {
        var target = ns.args[0];
        var maxMoney = Math.floor(ns.getServerMaxMoney(target)); // maximum money available on server
        var moneyAvailable = Math.floor(ns.getServerMoneyAvailable(target)); // current momey available on server
        var minSecurityLevel = Math.floor(ns.getServerMinSecurityLevel(target) * 1000) / 1000; // minimum security level of target server
        var securityLevel = Math.floor(ns.getServerSecurityLevel(target) * 1000) / 1000; // current security level of target server

        ns.tprint("Server: " + target);
        ns.tprint("Max money: " + maxMoney);
        ns.tprint("Money available: " + moneyAvailable);
        ns.tprint("Min security level: " + minSecurityLevel);
        ns.tprint("Security level: " + securityLevel);
    } else {
        ns.tprint("Usage: run test.js <target>");
    }
}