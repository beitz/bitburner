/** @param {NS} ns **/

// script is designed to be copied to target server and run locally
// this script manages the hacking, growing and weakening of the server

// todo: integrate the hacking success chance here. for example, if we have only 50% success chance, double the amount of threads for hacking or something like that
// todo: integrate the cpu cores as well for weaken and grow (apparently they don't affect hacking according to the documentation?!)
// todo: add logging of everything to either local file or if possible to a file on the home server

// basically what we do is we check the RAM requirements of the r_hack.js, r_grow.js and r_weaken.js scripts as well as the server's RAM
// then we determine how long each script will take to run
// then with some fancy math we can determine the optimal timing and amount of threads to run the script
// the goal is to have the weaken, grow and hack scripts run at the same time and finish at the same time
// Could look like this:
// hack for 5 seconds, then another 5 seconds, then another 5 seconds for a total of 15 seconds
// grow once for 13 seconds
// weaken once for 11 seconds
// repeat this every 16 seconds

export async function main(ns) {
    // ------------------ variables ------------------
    let target = ns.getHostname();
    let server = ns.getServer(target);
    let cores = server.couCores;

    // get the RAM requirements of the scripts
    let hack_ram = ns.getScriptRam('r_hack.js');
    let grow_ram = ns.getScriptRam('r_grow.js');
    let weaken_ram = ns.getScriptRam('r_weaken.js');
    let total_ram = ns.getServerRam(target);

    // get the time requirements of the scripts
    let hack_time = ns.getHackTime(target);
    let grow_time = ns.getGrowTime(target);
    let weaken_time = ns.getWeakenTime(target);
    let longest_time = Math.max(hack_time, grow_time, weaken_time);
    let time_margin = 100; // margin of error in ms. just to make absolutely sure we're only starting new scripts once the old ones are finished

    // get the amount of times the scripts can be run in one cycle
    let hack_times = Math.floor(longest_time / hack_time);
    let grow_times = Math.floor(longest_time / grow_time);
    let weaken_times = Math.floor(longest_time / weaken_time);

    // variables for storing the threads for each script
    let hack_threads, grow_threads, weaken_threads;

    // 2d array holding the [actions, waiting times, threads]
    let actions = [];

    // ------------------ function ------------------
    function timer() { // function returns the time in seconds since the last call
        // todo: test if the lastCallTime is not being lost between calls
        var currentTime = Date.now(); // current time
        var elapsedTime = Math.floor((currentTime - lastCallTime) / 1000); // time elapsed since last call in seconds
        lastCallTime = currentTime; // update last call time
        return elapsedTime;
    }

    function getDateTime() { // function returns current date time in this format: yyyy-mm-dd hh:mm:ss
        var now = new Date();
        var dateFormatted = now.toLocaleDateString(`sv`);
        var timeFormatted = now.toLocaleTimeString(`sv`);
        return `${dateFormatted} ${timeFormatted}`;
    }

    async function maxOutServer() { // function to max out the server money and min the security
        // this function will loop as long as it takes to reduce security to min and raise money to max. 
        while (true) {
            if (securityLevel > minSecurityLevel + securityThreshold) {
                let threads = Math.floor(total_ram / weaken_ram);
                ns.exec('r_weaken.js', target, threads);
                await ns.sleep(weaken_time + time_margin);
            } else if (moneyAvailable < maxMoney) {
                let threads = Math.floor(total_ram / grow_ram);
                ns.exec('r_grow.js', target, threads);
                await ns.sleep(grow_time + time_margin);
            } else {
                while (securityLevel > minSecurityLevel) {
                    let threads = Math.floor(total_ram / weaken_ram);
                    ns.exec('r_weaken.js', target, threads);
                    await ns.sleep(weaken_time + time_margin);
                }
                return;
            }
        }
    }

    // todo: continue here
    // I think I should max out the server, then run one hack to determine how much money we can hack
    // then I should do the same to determine the grow factor
    // security I should be able to calculate, as all values are known
    // I can use these values then to determine the amount of threads for each script

    // ------------------ calculating threads ------------------
    // we calculate the threads for each script




    // todo: finish this section

    // note to self: this will be a bit more complicated
    // the total amount of available ram will have to be distritbuted between the 3 scripts
    // the amount of times each script is run can be used to divide the ram usage of that script
    // for weaken:
    // the (times * threads) of the grow/weaken script should be considered to determine the amount of weakening we need to do. we should round up. 
    // for grow:
    // consider (times * threads) of the hack script to determine the amount of growing we need to do. we should round up.
    // for hack:
    // consider (times * threads) of the weaken script to determine the amount of hacking we need to do. we should round up.

    // how many threads of grow do we need to run to keep up with the hacking?
    grow_threads = Math.ceil(hack_times * hack_threads / grow_time);





    // ------------------ calculating times ------------------
    // we calculate the timing for each script
    for (let i = 0; i < hack_times; i++) {
        actions.push(["hack", hack_time + time_margin, hack_threads]);
    }
    for (let i = 0; i < grow_times; i++) {
        actions.push(["grow", grow_time + time_margin, grow_threads]);
    }
    for (let i = 0; i < weaken_times; i++) {
        actions.push(["weaken", weaken_time + time_margin, weaken_threads]);
    }

    // sort array by waiting time
    actions.sort((a, b) => a[1] - b[1]);

    // ------------------ main ------------------

    // we max out the server first before we get into the main loop
    await maxOutServer();

    while (true) {
        // we iterate through the array of actions and execute them in order
        for (let i = 0; i < actions.length; i++) {
            let action = actions[i][0];
            let wait_time = actions[i][1];
            let threads = actions[i][2];

            for (let j = 0; j < threads; j++) {
                if (action === "hack") {
                    ns.exec('r_hack.js', target, threads);
                } else if (action === "grow") {
                    ns.exec('r_grow.js', target, threads);
                } else if (action === "weaken") {
                    ns.exec('r_weaken.js', target, threads);
                }
                await ns.sleep(wait_time);
            }
        }

        ns.await(100); // at the end wait for a little bit, just in case
    }
}
