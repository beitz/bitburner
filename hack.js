/** @param {NS} ns */

// This is a script written for the game Bitburner V2.6

// todo: add proccess id to log file?
// todo: maybe check required ports?
// todo: write money threshhold to file somewhere so we can save that
// todo: actually, save the current phase we're in as well so we can jump right back into the right phase
// todo: use gradient decent for determining money threshhold to improve speed for cases where grow = 10% or so and hack = -0.4% ?
// todo: add multithreading to the script to improve speed.
//       - we'll have to provide the number of threads as an argument to the script as it doesn't seem to work with flags, no matter what I try.

// todo: maybe reduce security from time to time once theshold is reached when stuck in the loop where we increase hack amount by 1.
// todo: add amount of threads used to moneyThresholds.txt file
// todo: consider the threads that are being used when reducing security to prevent going too far with the security reduction.
// todo: - figure out how to get the threads in the first place. 

// todo: New Idea. Since using more threads just pushes the hack/grow/weaken to the extreme, maybe we can rewrite all of this to try to find the best values for securityThreshold, moneyThreshold and other variables by using gradient decent? 
//       - We could try to find the best value for each for each scenario and save that somewhere. 

// todo: Another new idea. Separate the first few phses into different scripts and leave only the simple hacking. 
//       - Use another script to manage all the scripts and keep track of the phases on each server and all related variables. 
//       - That script would be used to start or kill scripts, manage free RAM on the home server as well as other servers and it would try to maximize profits. 

// new process! 
// phase 1: reducing security
// phase 2: growing while keeping security low
// phase 3: grow to max, lower security to min. then hack x times and grow. if we reach max money after 1 grow, we increase x by 1. repeat until we can determine a good money threshold. (optionsl) save this value to a file
// phase 4: start hacking as normal

export async function main(ns) {
  // Check for correct number of arguments. If not, print help. 

  // Check number of arguments. If 0, print help.
  // reset moneyThreshold can be set to true or false. 
  if (ns.args.length < 1) {
    ns.tprint("Usage: run hack.js <target> (threads) (reset moneyThreshold)");
    ns.tprint("Example: run hack.js foodnstuff 5 true");
    ns.tprint("<target> = target server to hack");
    ns.tprint("(threads) = optional: number of threads to use. Default is 1.");
    ns.tprint("(reset moneyThreshold) = optional: reset the money threshold for the target server. Default is false."); // Useful if we're using more threads now and the ratio of the original money threshold is off.
    return;
  }

  // ns.disableLog('ALL') // just in case we need it, it's here. can be commented out if we want to have more data again. 

  // ------------------ variables ------------------
  var target = ns.args[0]; // target server
  var resetMoneyThreshold = ns.args[1] || false; // reset money threshold for the target server.
  var threads = ns.args[2] || 1; // number of threads to use. Default is 1.
  var logging = true; // allows to enable or disable logging in the log file. 
  var log_file = "log_hack_" + target + ".txt"; // log file where we log all the data. 
  var moneyThresholdsFile = "moneyThresholds.txt"; // file where we store the money thresholds for the servers.
  var securityThreshold = 0.05; // When the security is this much above the server minimum, we weaken the server again. 
  var moneyThreshold = 0.9; // The threshold (available money / max money on server) at which we are allowed to hack the server. 
  var phase = 0; // phase of the script. 0 = reducing security, 1 = growing, 2 = determining money threshold, 3 = hacking
  var lastCallTime = Date.now(); // initialize last call time
  var growAmount = 0; // amount of money we grow the server by
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

  function ws(value, targetLength) { // ws = with Space. Kept this name short to keep the code clean.
    return value.toString().padStart(targetLength, ' ');
  }

  function log(action, comment = "") {
    if (!logging) {
      return;
    }
    // Simple logging function to have some kind of overview of what's happening. Made to be exported to csv file for analysis.
    updateServerInfo();
    var log_array = [getDateTime(),
    ws(phase, 3),
    ws(timer(), 5),
    ws(action, 8),
    ws(securityLevel.toFixed(3), 8),
    ws(minSecurityLevel.toFixed(3), 8),
    ws(moneyAvailable, maxMoney.toString().length + 2),
    ws(maxMoney, maxMoney.toString().length + 2),
    ws(comment, comment.length + 2)];
    if (!ns.fileExists(log_file) || ns.read(log_file) === "") {
      ns.write(log_file, "timestamp|phase|timer|action|security|min security|available money|max money|comment" + "\n");
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
    let earnedMoney = 0;
    while (earnedMoney == 0) {
      earnedMoney = await ns.hack(target);
      if (earnedMoney == 0) {
        log("hack", "failed hacking ...");
      }
    }
    log("hack");
    return earnedMoney;
  }

  async function maxOutServer() {
    // this function will loop as long as it takes to reduce security to min and raise money to max. 
    log("info", "maxing out server");
    while (true) {
      updateServerInfo();
      if (securityLevel > minSecurityLevel + securityThreshold) {
        await weaken();
      } else if (moneyAvailable < maxMoney) {
        await grow();
      } else {
        while (securityLevel > minSecurityLevel) {
          await weaken(); // we weaken to min security
        }
        return;
      }
    }
  }

  function readData(file) {
    // this function will read the data from the file and return a 2d array with servers in the first column and thresholds in the second column
    let data = ns.read(file);
    if (data === "") {
      return [];
    }
    // Remove all carriage return characters
    data = data.replace(/\r/g, "");
    return data.split("\n").map(row => {
      const columns = row.split("|");
      // Assuming the second column should be converted to a number
      columns[1] = parseFloat(columns[1]);
      return columns;
    });
  }

  function writeData(file, data) {
    // this function will take the 2d array and write it to the file
    let dataStr = data.map(row => row.join("|")).join("\n");
    ns.write(file, dataStr, "w");
  }

  function findThreshold(server, data) {
    // this function will try to find the target server within the provided 2d array (should be first item in the column) and return the value from the second column if something is found
    // if nothing is found just return 0
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === server) {
        return data[i][1];
      }
    }
    return 0;
  }

  function addThreshold(server, threshold, data) {
    // this function will add a row to the 2d array if the server is not already in the array
    // if we already have the data, we don't add it again
    if (findThreshold(server, data) == 0) {
      ns.tprint("adding server");
      data.push([server, threshold]);
    } else {
      ns.tprint("server already exists");
    }
  }

  // ------------------ main script ------------------
  log("start", " >>>>> starting hack on server: " + target);

  // ------------------ phase 0 - reducing security ------------------
  log("info", " ----- starting phase 0 - reducing security");
  while (phase == 0) {
    if (securityLevel > minSecurityLevel + securityThreshold) {
      await weaken();
    } else {
      phase++;
    }
  }

  // ------------------ phase 1 - growing ------------------
  log("info", " ----- starting phase 1 - growing");
  while (phase == 1) {
    if (securityLevel > minSecurityLevel + securityThreshold) {
      await weaken();
    } else if (moneyAvailable < maxMoney) {
      await grow();
    } else {
      phase++;
    }
  }

  // first we check if the server is already in the data file. if it is, we use that value as the money threshold and skip phase 2.
  var moneyThresholdData = readData(moneyThresholdsFile);
  let serverExistsInData = findThreshold(target, moneyThresholdData);
  if (!resetMoneyThreshold) { // if we're not resetting the money threshold, we use the value from the file if it exists.
    if (serverExistsInData != 0) {
      log("info", "Using money threshold from file: " + serverExistsInData);
      moneyThreshold = serverExistsInData;
      phase++;
    }
  }

  // ------------------ phase 2 - determining money threshold ------------------
  log("info", " ----- starting phase 2 - determining money threshold");
  while (phase == 2) {
    // first we check if our hacking level is high enough to hack the server. if not, we wait until it is.
    log("info", "checking hacking level. Current hacking level: " + ns.getHackingLevel() + ", required hacking level: " + ns.getServerRequiredHackingLevel(target));
    if (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(target)) {
      await ns.sleep(waitTimeForHackingLevel * 60 * 1000); // wait x minutes before attempting to hack again
      log("Waiting for hacking level (" + waitTimeForHackingLevel + " minutes). Current hacking level: " + ns.getHackingLevel() + ", required hacking level: " + ns.getServerRequiredHackingLevel(target));
    }

    // Now we hack the server x times and grow it. if we reach max money after 1 grow, we increase x by 1. repeat until we can determine a good money threshold.
    // This is just in case we overshoot with the grow amount, e.g. hack reduces money by 1%, but we increase money by 10% with grow. This is to prevent this from giving us an inefficient value for the money theshold. Though I have absolutely no idea if this will ever even occur. 
    var hack_amount = 1; // number of times we hack the server before growing
    log("info", "starting loop to determine money threshold. Current hack amount: " + hack_amount);
    while (true) {
      // at this point we should have money maxed on the server and security should be close to the minimum. 
      await maxOutServer();

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
      log("info", "server has grown by " + growAmount);

      updateServerInfo();
      if (moneyAvailable == maxMoney) {
        // we grew more than we reduce with hack so we increase x by 1 and try again after resetting the initial conditions. 
        log("info", "we grew more than we reduced with hack. increasing hack amount by 1 and trying again. Current hack amount: " + hack_amount);
        hack_amount++;
      } else {
        // we determine the grow amount and set the money threshold.
        moneyThreshold = growAmount - 1;
        log("info", "money threshhold set to " + moneyThreshold + " (grow amount: " + growAmount + ")");

        // we add the server to the data file with the money threshold
        var moneyThresholdData = readData(moneyThresholdsFile);
        let serverExistsInData = findThreshold(target, moneyThresholdData);
        if (serverExistsInData == 0) {
          addThreshold(target, moneyThreshold, moneyThresholdData);
          writeData(moneyThresholdsFile, moneyThresholdData);
        }

        phase++;
        break;
      }
    }
  }

  // ------------------ phase 3 - hacking ------------------
  log("info", " ----- starting phase 3 - hacking");
  while (phase == 3) {
    updateServerInfo();
    if (securityLevel > minSecurityLevel + securityThreshold) {
      await weaken();
    } else if (moneyAvailable < maxMoney * (1 - moneyThreshold)) {
      await grow();
    } else {
      await hack();
    }
  }

  log("error", "error 49450"); // we should never reach this point
  ns.tprint("error 49450");
  return;
}