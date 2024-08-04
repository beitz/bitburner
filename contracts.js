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


export async function main(ns) {
    // ------------------ variables ------------------
    let contractScriptsFile = "contracts/contract_scripts.txt";
    let contractData; // 2d array containing the contract type, script file and status

    if (!ns.fileExists(contractScriptsFile)) { // if the contractScriptsFile doesn't exist, initialize it
        contractData = [["contract type", "script file", "status"]];
        let contracts = ns.codingcontract.getContractTypes(); // list of all contract types
        for (let i = 1; i < contracts.length; i++) {
            contractData.push([contracts[i], `contracts/${contracts[i].replace(/ /g, '_')}.js`, "todo"]);
        }
        writeData(ns, contractScriptsFile, contractData);
        // ns.tprint("file initialized")
    } else { // we read the data from the file
        contractData = readData(ns, contractScriptsFile);
        // ns.tprint("file read")
    }

    // first we go through all servers and look for files that contain "contract" in their name
    let serverData = readData(ns, "data/servers_current.txt");
    let index_hostname = serverData[0].indexOf('hostname');

    if (ns.args.length === 0) { // if no args, print help
        ns.tprint("Usage: run contracts.js <command> <args>");
        ns.tprint("Available commands:");
        ns.tprint("- list: list all contracts on all servers");
        ns.tprint("- do <number>: do contract with number <number>");
        return;
    }

    if (ns.args[0] === 'list') { // list all contracts on all servers
        for (let i = 1; i < serverData.length - 1; i++) {
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

        let contractNumber = ns.args[1];
        let contractFile = `contract-${contractNumber}.cct`;
        let contractFound = false;
        let contractHost = "";

        // go through all hosts in serverData and check if the contract with the given number exists
        for (let i = 1; i < serverData.length - 1; i++) {
            let hostname = serverData[i][index_hostname];
            // ns.tprint(`Checking ${hostname}`);
            let files = ns.ls(serverData[i][index_hostname]);
            for (let file of files) {
                if (file === contractFile) {
                    contractFound = true;
                    contractHost = hostname;
                }
            }
        }
        let contractType = ns.codingcontract.getContractType(contractFile, contractHost);

        if (!contractFound) {
            ns.tprint(`Contract with number ${contractNumber} not found`);
            return;
        } else {
            ns.tprint(`Found contract with number ${contractNumber} on ${contractHost}, type: ${contractType}`);
            // we found the contract, now we need to check if the script is done by checking in the array contractData
            // if it is, we can attempt the contract
            let contractScript = "";
            for (let i = 1; i < contractData.length; i++) {
                if (contractData[i][0] === contractType) {
                    contractScript = contractData[i][1];
                    if (contractData[i][2] === "done") {
                        // lets first check if we have enough free ram to execute the script
                        let maxRam = ns.getServerMaxRam('home');
                        let usedRam = ns.getServerUsedRam('home');
                        let scriptRam = ns.getScriptRam(contractScript, 'home');
                        if (usedRam + scriptRam > maxRam) {
                            ns.tprint(`Not enough free RAM to execute script: ${contractScript}. We have ${Math.floor(maxRam - usedRam)} RAM available, but we need ${scriptRam} RAM`);
                            return;
                        }
                        // if the script is done, we can attempt to solve it
                        ns.tprint(`Attempting contract: |${contractScript}| on |${contractHost}| for contract |${contractFile}|`);
                        // ns.run(contractScript, 1, contractFile, contractHost); // 1 thread, first arg = contract file, second arg = host
                        let pid = ns.exec(contractScript, contractHost, 1, contractFile, contractHost);
                        ns.tprint(`pid: ${pid}`);
                        ns.tprint(`this is what we are trying to execute:`);
                        ns.tprint(`ns.exec(${contractScript}, ${contractHost}, 1, ${contractFile}, ${contractHost})`);
                        // let's print the types of the variables we are trying to execute
                        ns.tprint(`contractScript: ${typeof contractScript}`);
                        ns.tprint(`contractHost: ${typeof contractHost}`);
                        ns.tprint(`contractFile: ${typeof contractFile}`);
                    } else {
                        ns.tprint(`Contract script not done yet: ${contractScript}`);
                        return;
                    }
                    break;
                }
            }
        }
    }
}
