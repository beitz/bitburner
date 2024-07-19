/** @param {NS} ns */

// This is a script written for the game Bitburner V2.6

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

  // ------------------ main script ------------------
  log("start", "starting hack on server: " + target);

  // ------------------ phase 1 - reducing security ------------------
  while (phase == 0) {
    if (securityLevel > minSecurityLevel + securityThreshold) {
      await ns.weaken(target);
      log("weaken");
    } else {
      phase++;
    }
  }

  // ------------------ phase 2 - growing ------------------
  while (phase == 1) {
    if (securityLevel > minSecurityLevel + securityThreshold) {
      await ns.weaken(target);
      log("weaken");
    } else if (moneyAvailable < maxMoney) {
      await ns.grow(target);
      log("grow");
    } else {
      phase++;
    }
  }

  // ------------------ phase 3 - determining money threshold ------------------
  while (phase == 2) {
    // at this point we should have money maxed on the server and security should be close to the minimum. 
    // with one last security reduction, we can also reduce security to the minimum to have perfect conditions for determining the growth factor. 

    await ns.weaken(target);
    log("weaken");

    // first we check if our hacking level is high enough to hack the server. if not, we wait until it is.
    if (ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel()) {
      await ns.sleep(waitTimeForHackingLevel * 60 * 1000); // wait x minutes before attempting to hack again
      log("Waiting for hacking level (" + waitTimeForHackingLevel + " minutes). Current hacking level: " + ns.getHackingLevel() + ", required hacking level: " + ns.getServerRequiredHackingLevel(target));
    }

    // now we hack the server x times and grow it. if we reach max money after 1 grow, we increase x by 1. repeat until we can determine a good money threshold.
  }

  // ------------------ phase 4 - hacking ------------------

}
// ------------------------------------------------


// todo: add proccess id to log file
// todo: somehow add backdoor installing in here
// todo: add nuking at beginning
// todo: check required hacking level and required ports
// todo: floor security to 3 digits or so in log file. floor money to 0 digits. 
// todo: also log in separate column: current hacking level? time since last loop? 
// todo: combine log function together with actions like hack, grow and weaken? 
// todo: add to log function the time in seconds since last log function call instead of total time since start of script
// todo: to initialize everything. first reduce security, then grow and reduce security, then alternate between hacking and growing and weaken until one grow after a hack does not get us to max money. that will be the new money threshhold. 
// todo: write money threshhold to file somewhere so we can save that

// ns.disableLog('ALL')

export async function main(ns) {
  if (securityLevel < minSecurityLevel + securityThreshold) { // in case server already is maxxed out, we can hack to make sure we remove some money so we have room to grow
    if (moneyAvailable > maxMoney * moneyThreshold) {
      log("hack");
      await ns.hack(target);
    }
  }

  while (true) { // first we reduce security and grow the server to near max. 
    loop++;
    var moneyAvailable = Math.floor(ns.getServerMoneyAvailable(target)); // current momey available on server
    var securityLevel = Math.floor(ns.getServerSecurityLevel(target) * 1000) / 1000; // current security level of target server

    if (securityLevel > minSecurityLevel + securityThreshold) {
      log("weaken");
      await ns.weaken(target);
    } else if (moneyAvailable < maxMoney) {
      log("grow");
      growAmountLast = growAmount;
      growAmount = await ns.grow(target);
    } else {
      break; // if we're at a point where we could hack, we go to the next loop
    }
  }
  ns.write(log_file, "grow amount last: " + growAmountLast + "\n");
  moneyThreshold = 1 - growAmountLast;
  log("", "money threshhold set to " + moneyThreshold);

  while (true) {
    var action = "";
    loop++;

    var moneyAvailable = Math.floor(ns.getServerMoneyAvailable(target)); // current momey available on server
    var securityLevel = Math.floor(ns.getServerSecurityLevel(target) * 1000) / 1000; // current security level of target server

    if (securityLevel > minSecurityLevel + securityThreshold) {
      action = "weaken";
    } else if (moneyAvailable < maxMoney * moneyThreshold) {
      action = "grow";
    } else {
      action = "hack";
    }

    log(action);

    switch (action) {
      case "weaken":
        await ns.weaken(target);
        break;
      case "grow":
        await ns.grow(target);
        break;
      case "hack":
        // if we can hack, we do so. but if we don't have the required hacking level, we wait for 10 minutes before trying again. 
        if (ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel()) {
          await ns.hack(target);
        } else {
          while (ns.getServerRequiredHackingLevel(target) > ns.getHackingLevel()) {
            ns.write(log_file, getDateTime() + " | Hacking level (" + ns.getHackingLevel() + ") too low for server: " + target + " (" + ns.getServerRequiredHackingLevel(target) + ")" + "\n");
            await ns.sleep(1000 * 60 * 10); // wait 10 minutes
          }
        }
        break;
      default:
        ns.tprint("error 51654");
        log("error 51654");
        return;
    }
  }
}