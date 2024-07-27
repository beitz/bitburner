/** @param {NS} ns **/

export async function main(ns) { // let's do some hacking and growing to determine how the hacked money and growed money are being calculated
    let target = ns.getHostname(); // get current server name
    let server = ns.getServer(target); // get server object
    // let hackedMoneyFactor; // factor to determine how much money we can hack
    // let growedMoneyFactor; // factor to determine how much money we can grow
    let maxMoney = server.moneyMax; // max money on server

    function getDateTime() { // function returns current date time in this format: yyyy-mm-dd hh:mm:ss
        var now = new Date();
        var dateFormatted = now.toLocaleDateString(`sv`);
        var timeFormatted = now.toLocaleTimeString(`sv`);
        return `${dateFormatted} ${timeFormatted}`;
    }

    function log(msg) { // logs the data to the file test_log.txt
        let dateTime = getDateTime();
        let currentMoney = server.moneyAvailable;
        let maxMoney = server.moneyMax;
        let currentSecurity = server.hackDifficulty;
        let minSecurity = server.minDifficulty;
        let comment = msg;

        let message = `${dateTime}|${currentMoney}|${maxMoney}|${currentSecurity}|${minSecurity}|${comment}`;

        ns.write('test_log.txt', message + '\n', 'a');
    }
    log('date time|current money|max money|current security|max security|comment');

    async function maxOutServer() { // function to max out the server money and min the security
        // this function will loop as long as it takes to reduce security to min and raise money to max. 
        while (true) {

            if (server.hackDifficulty > server.minDifficulty + 0.05) {
                await ns.weaken(target);
            } else if (server.moneyAvailable < server.moneyMax) {
                await ns.grow(target);
            } else {
                while (server.hackDifficulty > server.minDifficulty) {
                    await ns.weaken(target);
                }
                return;
            }
        }
    }

    log('Starting test on ' + target);

    for (let i = 0; i < 4; i++) {
        log('maxing out server');
        await maxOutServer(); // max out the server

        log('Hacking once with' + (i + 1) + ' threads');
        await ns.hack(target, { threads: i + 1 }); // one hack should raise security by 0.002
    }

    log('starting determining the grow factor.');
    // now we can determine the grow factor
    let hack_thrads = 1;
    let grow_amount;
    while (true) {
        await maxOutServer();

        await ns.hack(target, { threads: hack_thrads }); // one hack should raise security by 0.002
        grow_amount = await ns.grow(target, { threads: 1 });
        if (server.moneyAvailable === maxMoney) {
            hack_thrads++;
        } else {
            break;
        }
    }
    log('grow factor is ' + grow_amount);
}
