/** @param {NS} ns */

// simple version of hacking script
// usage: run hack_simple.js <target server name> <money threshhold>
// example: run hack_simple.js foodnstuff 0.9
// <target server name> is the name of the server you want to hack
// <money threshhold> is the threshold (available money / max money on server) at which we will hack the server

export async function main(ns) {
    // check for correct amount of args. if not, print help. 
    if (ns.args.length != 2) {
      ns.tprint('run hack.js <target server name> <money threshhold>');
      return;
    }
  
    var target = ns.args[0]; // target server
    var securityThreshold = 0.05;
    var moneyThreshold = ns.args[1];
  
    // get initial values for those variables
    var maxMoney = Math.floor(ns.getServerMaxMoney(target)); // maximum money available on server
    var minSecurityLevel = Math.floor(ns.getServerMinSecurityLevel(target) * 1000) / 1000; // minimum security level of target server
  
    while (true) {
      var moneyAvailable = Math.floor(ns.getServerMoneyAvailable(target)); // current momey available on server
      var securityLevel = Math.floor(ns.getServerSecurityLevel(target) * 1000) / 1000; // current security level of target server
  
      if (securityLevel > minSecurityLevel + securityThreshold) {
        await ns.weaken(target);
      } else if (moneyAvailable < maxMoney * moneyThreshold) {
        await ns.grow(target);
      } else {
        await ns.hack(target);
      }
    }
  }