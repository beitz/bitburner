/** @param {NS} ns */

// simple version of hacking script specifically made to be run on target server by ns.exec()

// usage: execute with ns.exec(script, target, threads, arg1, arg2, ...)
// args:
// - arg1: number of threads to use for hacking
// - arg2: money threshold at which we will hack the server

export async function main(ns) {
    // get the server we're on
    let target = ns.getHostname();
    let threads = ns.args[0] || 1;
    let moneyThreshold = ns.args[1] || 0.9;
    let securityThreshold = 0.05;
    let moneyAvailable = 0;
    let securityLevel = 0;

    // get initial values for those variables
    const maxMoney = ns.getServerMaxMoney(target); // maximum money available on server
    const minSecurityLevel = ns.getServerMinSecurityLevel(target); // minimum security level of target server
  
    while (true) {
      moneyAvailable = ns.getServerMoneyAvailable(target); // current momey available on server
      securityLevel = ns.getServerSecurityLevel(target); // current security level of target server
  
      if (securityLevel > minSecurityLevel + securityThreshold) {
        await ns.weaken(target);
      } else if (moneyAvailable < maxMoney * moneyThreshold) {
        await ns.grow(target);
      } else {
        await ns.hack(target);
      }
    }
  }