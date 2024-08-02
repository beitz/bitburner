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

function writeData(ns, file, data) { // function to write the data to a file
    let formattedData = ''; // data we will write to the file

    // check if is 2d array
    if (Array.isArray(data) && Array.isArray(data[0])) {
        // we have a 2d array and everything is fine, so we can print the contents
        for (let i = 0; i < data.length; i++) { // rows
            for (let j = 0; j < data[i].length; j++) { // columns
                // lines are separated by a newline character, columns are separated by a | character
                if (j === data[i].length - 1) {
                    formattedData += data[i][j] + '\n';
                } else {
                    formattedData += data[i][j] + '|';
                }
            }
        }
    } else {
        // we have a 1d array or something else, so we need to print an error message and return
        ns.tprint(`Error: Data is not a 2d array. Data: ${data}`);
        return;
    }

    ns.write(file, formattedData, 'w');
}

// available functions (https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.codingcontract.md):
// attempt(answer, filename, host)	Attempts a coding contract, returning a reward string on success or empty string on failure.
// createDummyContract(type)	Generate a dummy contract.
// getContractType(filename, host)	Get the type of a coding contract.
// getContractTypes()	List all contract types.
// getData(filename, host)	Get the input data.
// getDescription(filename, host)	Get the description.
// getNumTriesRemaining(filename, host)	Get the number of attempts remaining.

// ------------------ variables ------------------
let contractScriptsFile = "contracts/contract_scripts.txt";

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
        // if the contract_scripts.txt file exists, we can continue. else we create it and initialize it with the contract types
        if (!ns.fileExists("contracts/contract_scripts.txt")) {
            let contractData = [["contract type", "script file", "status"]];
            let contractTypes = ns.codingcontract.getContractTypes();
            for (let type of contractTypes) {
                contractData.push([type, "", "todo"]);
            }
            ns.tprint("--------------------");
            ns.tprint(contractData);
            ns.tprint("--------------------");
            writeData(ns, contractScriptsFile, contractData);
        }

        // todo: figure out how

        // first we can list all available contract types.
        // then I'll save those as a 2d array in a file with those headers:
        // |contract type|script file|status|

        // then I'll first have to write the script files for each contract type
    }
    
}
