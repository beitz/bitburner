/** @param {NS} ns */

// This is a script written for the game Bitburner V2.6

// todo: add proccess id to log file?
// todo: maybe check required ports?
// todo: write money threshhold to file somewhere so we can save that

// new process! 
// phase 1: reducing security
// phase 2: growing while keeping security low
// phase 3: grow to max, lower security to min. then hack x times and grow. if we reach max money after 1 grow, we increase x by 1. repeat until we can determine a good money threshold. (optionsl) save this value to a file
// phase 4: start hacking as normal

export async function main(ns) {
  // Check for correct number of arguments. If not, print help. 
  if (ns.args.length != 1) {
    ns.tprint('[this_script.js] [target server name]');
    return;
  }

  // ns.disableLog('ALL') // just in case we need it, it's here. can be commented out if we want to have more data again. 

  // ------------------ variables ------------------
  var target = ns.args[0]; // target server
  var logging = true; // allows to enable or disable logging in the log file. 
  var log_file = "log_hack_" + target + ".txt"; // log file where we log all the data. 
  var securityThreshold = 0.05; // When the security is this much above the server minimum, we weaken the server again. 
  var moneyThreshold = 0.9; // The threshold (available money / max money on server) at which we are allowed to hack the server. 
  var phase = 0; // phase of the script. 0 = reducing security, 1 = growing, 2 = determining money threshold, 3 = hacking
  var lastCallTime = Date.now(); // initialize last call time
  var growAmount = 0; // amount of money we grow the server by
  var growAmountLast = 0; // amount of money we grew the server by last loop
  var maxMoney = Math.floor(ns.getServerMaxMoney(target)); // maximum money available on server
  var moneyAvailable = Math.floor(ns.getServerMoneyAvailable(target)); // current momey available on server
  var minSecurityLevel = Math.floor(ns.getServerMinSecurityLevel(target) * 1000) / 1000; // minimum security level of target server
  var securityLevel = Math.floor(ns.getServerSecurityLevel(target) * 1000) / 1000; // current security level of target server
  var waitTimeForHackingLevel = 10; // time to wait for hacking level to be high enough to hack the server

  // ------------------ functions ------------------
  function timer() {
    var currentTime = Date.now(); // current time
    var elapsedTime = Math.floor((currentTime - lastCallTime) / 1000); // time elapsed since last call in seconds
    lastCallTime = currentTime; // update last call time
    return elapsedTime;
  }

  function getDateTime() {
    var now = new Date();
    var dateFormatted = now.toLocaleDateString(`sv`);
    var timeFormatted = now.toLocaleTimeString(`sv`);
    return `${dateFormatted} ${timeFormatted}`;
  }

  function updateServerInfo() {
    maxMoney = Math.floor(ns.getServerMaxMoney(target)); // maximum money available on server
    moneyAvailable = Math.floor(ns.getServerMoneyAvailable(target)); // current momey available on server
    minSecurityLevel = Math.floor(ns.getServerMinSecurityLevel(target) * 1000) / 1000; // minimum security level of target server
    securityLevel = Math.floor(ns.getServerSecurityLevel(target) * 1000) / 1000; // current security level of target server
  }

  function log(action, comment = "") {
    // Simple logging function to have some kind of overview of what's happening. Made to be exported to csv file for analysis.
    updateServerInfo();
    var log_array = [phase, getDateTime(), timer(), action, moneyAvailable, maxMoney, securityLevel, minSecurityLevel, comment];
    if (!ns.fileExists(log_file) || ns.readFile(log_file) === "") {
      ns.write(log_file, "phase|timestamp|timer|action|available money|max money|security|min security|comment" + "\n");
    }
    var log_string = log_array.join("|");
    ns.write(log_file, log_string + "\n");
    return;
  }

  async function grow() {
    let growth = await ns.grow(target);
    log("grow");
    return growth;
  }

  async function weaken() {
    let reducedSecurity = await ns.weaken(target);
    log("weaken");
    return reducedSecurity;
  }

  async function hack() {
    let earnedMoney = await ns.hack(target);
    log("hack");
    return earnedMoney;
  }

  async function maxOutServer() {
    // this function will loop as long as it takes to reduce security to min and raise money to max. 
    while (true) {
      updateServerInfo();
      if (securityLevel > minSecurityLevel + securityThreshold) {
        await weaken();
      } else if (moneyAvailable < maxMoney) {
        await grow();
      } else {
        await weaken(); // we weaken just once more, just in case
        return;
      }
    }
  }

  // ------------------ main script ------------------
  log("start", "starting hack on server: " + target);

  // ------------------ phase 1 - reducing security ------------------
  while (phase == 0) {
    if (securityLevel > minSecurityLevel + securityThreshold) {
      await weaken();
    } else {
      phase++;
    }
  }

  // ------------------ phase 2 - growing ------------------
  while (phase == 1) {
    if (securityLevel > minSecurityLevel + securityThreshold) {
      await weaken();
    } else if (moneyAvailable < maxMoney) {
      await grow();
    } else {
      phase++;
    }
  }

  // ------------------ phase 3 - determining money threshold ------------------
  while (phase == 2) {
    // at this point we should have money maxed on the server and security should be close to the minimum. 
    await maxOutServer();

    // first we check if our hacking level is high enough to hack the server. if not, we wait until it is.
    if (ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel()) {
      await ns.sleep(waitTimeForHackingLevel * 60 * 1000); // wait x minutes before attempting to hack again
      log("Waiting for hacking level (" + waitTimeForHackingLevel + " minutes). Current hacking level: " + ns.getHackingLevel() + ", required hacking level: " + ns.getServerRequiredHackingLevel(target));
    }

    // Now we hack the server x times and grow it. if we reach max money after 1 grow, we increase x by 1. repeat until we can determine a good money threshold.
    // This is just in case we overshoot with the grow amount, e.g. hack reduces money by 1%, but we increase money by 10% with grow. This is to prevent this from giving us an inefficient value for the money theshold. Though I have absolutely no idea if this will ever even occur. 
    var hack_amount = 1; // number of times we hack the server before growing
    while (true) {
      updateServerInfo();
      if (securityLevel == minSecurityLevel && moneyAvailable == maxMoney) { // just making sure we actually have the initial conditions met
        for (var i = 0; i < hack_amount; i++) {
          await hack();
        }
      } else {
        log("error", "error 49449"); // this should never even be possible. 
        ns.tprint("error 49449");
        return;
      }

      growAmount = await grow();

      updateServerInfo();
      if (moneyAvailable == maxMoney) {
        // we grew more than we reduce with hack so we increase x by 1 and try again after resetting the initial conditions. 
        hack_amount++;
      } else {
        // we determine the grow amount and set the money threshold.
        moneyThreshold = 1 - growAmount;
        log("", "money threshhold set to " + moneyThreshold + " (grow amount: " + growAmount + ")");
        phase++;
        break;
      }
    }
  }

  // todo: save the money threshold to a file somewhere so we can load it and skip this whole initial phase in the future.

  // ------------------ phase 4 - hacking ------------------
  while (phase == 4) {
    updateServerInfo();
    if (securityLevel > minSecurityLevel + securityThreshold) {
      await weaken();
    } else if (moneyAvailable < maxMoney * moneyThreshold) {
      await grow();
    } else {
      await hack();
    }
  }
}