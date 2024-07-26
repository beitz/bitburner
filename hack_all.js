/** @param {NS} ns */

// script should read the servers.txt file and depending on provided arguments nuke servers and hack them
// if old scripts are running, kill them all and start new ones

// todo: add backdoor
// todo: figure out how to distribute my RAM for hacking
// todo: also use private servers as well as home for hacking
// todo: save all process IDs in a file so we can kill them later
// todo: add function to delete hack files on all servers to clean up

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

    function openPorts(server) {
        // we try to open as many ports as possible
        if (ns.fileExists('BruteSSH.exe', 'home')) ns.brutessh(server);
        if (ns.fileExists('FTPCrack.exe', 'home')) ns.ftpcrack(server);
        if (ns.fileExists('relaySMTP.exe', 'home')) ns.relaysmtp(server);
        if (ns.fileExists('HTTPWorm.exe', 'home')) ns.httpworm(server);
        if (ns.fileExists('SQLInject.exe', 'home')) ns.sqlinject(server);    
    }

    // ------------------ variables and args ------------------
    const file = "data/servers_current.txt";    
    const hack_file = "hack_simple_2.js";
    let serverData = await readData(file);
    let actions = ['nuke']; // array that will hold the actions we want to take on the servers. order is important

    if (ns.args[0] === 'help') {
        ns.tprint("Usage: run hack_all.js <args>");
        ns.tprint("Arguments choose which servers to hack. The following arguments are available:");
        ns.tprint("  nuke: Nuke all servers that can be nuked. Also opens ports. ");
        ns.tprint("  hack: Hack all servers that can be hacked. ");
        ns.tprint("  kill: Kills all running scripts on all servers. ");
        return;
    } else if (ns.args.length === 0) {
        // we'll just use the default actions in this case if the user doesn't specify any specific actions
    } else {
        actions = [];
    }

    for (let i = 0; i < ns.args.length; i++) {
        actions.push(ns.args[i]);
    }

    // ------------------ run actions ------------------
    let indexName = serverData[0].indexOf('hostname');
    let indexAdmin = serverData[0].indexOf('hasAdminRights');
    let indexPorts = serverData[0].indexOf('numOpenPortsRequired');
    let indexMoneyMax = serverData[0].indexOf('moneyMax');
    let indexRequiredHackingSkill = serverData[0].indexOf('requiredHackingSkill');
    let indexPurchasedByPlayer = serverData[0].indexOf('purchasedByPlayer');
    let playerHackingLevel = ns.getHackingLevel();
    let openablePorts = 0; // number of ports we can open

    // for each file that we have to open a port we increase the openablePorts counter
    if (ns.fileExists('BruteSSH.exe', 'home')) openablePorts++;
    if (ns.fileExists('FTPCrack.exe', 'home')) openablePorts++;
    if (ns.fileExists('relaySMTP.exe', 'home')) openablePorts++;
    if (ns.fileExists('HTTPWorm.exe', 'home')) openablePorts++;
    if (ns.fileExists('SQLInject.exe', 'home')) openablePorts++;

    while (actions.length > 0) {
        let action = actions.shift();

        for (let i = 1; i < serverData.length-1; i++) { // we start at 1 to skip the header row
            let server = ns.getServer(serverData[i][indexName]);

            if (action === 'nuke') {
                // ns.tprint(`Opening ports on ${serverData[i][indexName]}`);
                openPorts(serverData[i][indexName]);

                // only nuke if enough ports are open
                if (serverData[i][indexPorts] <= openablePorts && !serverData[i][indexAdmin]) {
                    // ns.tprint(`Nuking ${serverData[i][indexName]}`);
                    ns.nuke(serverData[i][indexName]);
                }
            }
            if (action === 'hack') {
                // todo: kind of figure out what hack script to run with how many threads etc and with what parameters
                // todo: also differentiate between servers that are bought by me and other servers

                // we check the following things before we attempt a hack
                // - we have admin rights
                // - we have the required hacking skill
                // - we have the required ports open
                // - the server has more than 0 max money
                // - the server is not purchased by us

                if (serverData[i][indexAdmin] && playerHackingLevel >= serverData[i][indexRequiredHackingSkill] && serverData[i][indexPorts] <= openablePorts && serverData[i][indexMoneyMax] > 0 && !serverData[i][indexPurchasedByPlayer]) {
                    // we figure out the available ram on the server
                    let maxRAM = server.maxRam;
                    let scriptRam = ns.getScriptRam(hack_file);

                    // we calculate the maximum number of threads we can run
                    let maxThreads = Math.floor(maxRAM / scriptRam);
                    // figure out by how much the server would grow if we would grow it and use it in conjunction with the threads etc. to determine the moneyThreshold
                    let moneyThreshold = 0.9; // threshold at which we will hack the server

                    // we copy the hack file to the target server
                    ns.scp(hack_file, serverData[i][indexName]);

                    // we hack
                    // ns.tprint(`Hacking ${serverData[i][indexName]} with ${maxThreads} threads`);
                    ns.exec(hack_file, serverData[i][indexName], maxThreads, moneyThreshold);
                }
            }
        }
    }
}