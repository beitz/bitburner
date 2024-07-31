/** @param {NS} ns **/

// script used to work with contracts

// ------------------ functions ------------------
function readData(ns, file) { // function to read the data from a file
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

// available functions (https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.codingcontract.md):
// attempt(answer, filename, host)	Attempts a coding contract, returning a reward string on success or empty string on failure.
// createDummyContract(type)	Generate a dummy contract.
// getContractType(filename, host)	Get the type of a coding contract.
// getContractTypes()	List all contract types.
// getData(filename, host)	Get the input data.
// getDescription(filename, host)	Get the description.
// getNumTriesRemaining(filename, host)	Get the number of attempts remaining.

export async function main(ns) {
    // first we go through all servers and look for files that contain "contract" in their name
    let serverData = readData(ns, "data/servers_current.txt");
    let index_hostname = serverData[0].indexOf('hostname');

    if (ns.args[0] === 'list') { // list all contracts on all servers
        for (let i = 1; i < serverData.length-1; i++) {
            let hostname = serverData[i][index_hostname];
            let files = ns.ls(serverData[i][index_hostname]);
            for (let file of files) {
                if (file.includes("contract-")) {
                    ns.tprint(`Found contract on ${hostname}: ${file}, type: ${ns.codingcontract.getContractType(file, hostname)}`);
                }
            }
        }
    } else if (ns.args[0] === 'do') { // we try to do the contract using script in "contract/script.js"
        // todo: figure out how

        // first we can list all available contract types.
        // then I'll save those as a 2d array in a file with those headers:
        // |contract type|script file|status|

        // then I'll first have to write the script files for each contract type
    }
    
}
