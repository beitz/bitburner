/** @param {NS} ns **/

// script should read the servers.txt and go through all our servers (including home server?) and run hack scripts
// hacking should be distributed over all currently hackable servers depending on their max money and hacking difficulty
// when run, we should kill all currently running scripts and then start hacking again
// I guess we should use the hack_simple_3.js script for this

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
    const hack_file = "hack_simple_3.js";
    let serverData = await readData(file);

    // get index of the following column headers: 'hostname', 'maxMoney', 'hackDifficulty'
    let index_hostname = serverData[0].indexOf('hostname');
    let index_maxMoney = serverData[0].indexOf('moneyMax');
    let index_hackDifficulty = serverData[0].indexOf('requiredHackingSkill');
    let index_purchasedByPlayer = serverData[0].indexOf('purchasedByPlayer');
    let index_hackable = serverData[0].indexOf('hackable');
    
    // ------------------ main ------------------

    // todo: go through all purchased servers and kill all running scripts
    // todo: determine which servers to hack and with how many threads
    // todo: go through all purchased servers and run the hack script on them

    // ns.exec(hack_file, purchased_server, threads, threads, target_server)
}
