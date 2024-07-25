/** @param {NS} ns **/

// todo: replace the pos. with a tree like structure with those characters: └─, ├─, │, ┌, ┐, ┬, ┴, ─

const printColumns = ['pos.', 'hostname', 'hasAdminRights', 'numOpenPortsRequired', 'maxRam', 'moneyAvailable', 'moneyMax', 'requiredHackingSkill', 
    'admin', 'ports', 'ram', 'money', 'max money', 'hack']; // added the shortened column names to the printColumns array as well so the printing at the end should work with either the full or the shortened names

export async function main(ns) {
    const file = "data/servers_current.txt";

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

    // Get the server data from the file
    let serverData = readData(file);

    // we change the formatting of some of the data
    // if the column is 'moneyMax' or 'moneyAvailable', we format the number to a string with 4 significant digits. e.g. 5.123e+6
    // if the column is 'pos.' we print the position as a string but without the decimal places
    for (let i = 1; i < serverData.length-1; i++) { // rows (last row should always be empty, that's why we skip it. We also skip the first row, because it's the header row)
        for (let j = 0; j < serverData[0].length; j++) { // columns
            if (serverData[0][j] === 'moneyMax' || serverData[0][j] === 'moneyAvailable') {
                serverData[i][j] = parseFloat(serverData[i][j]).toExponential(1);
            }
            if (serverData[0][j] === 'pos.') {
                serverData[i][j] = serverData[i][j].toString().replace(/\./g, '');
            }
        }
    }

    // we change the name of some of the headings of the header row to shorten the names
    for (let i = 0; i < serverData[0].length; i++) {
        switch (serverData[0][i]) {
            case 'hasAdminRights':
                serverData[0][i] = 'admin';
                break;
            case 'numOpenPortsRequired':
                serverData[0][i] = 'ports';
                break;
            case 'maxRam':
                serverData[0][i] = 'ram';
                break;
            case 'moneyAvailable':
                serverData[0][i] = 'money';
                break;
            case 'moneyMax':
                serverData[0][i] = 'max money';
                break;
            case 'requiredHackingSkill':
                serverData[0][i] = 'hack';
                break;
        }
    }

    // We determine the max length of each column
    let columnLengths = [];
    for (let i = 0; i < serverData.length-1; i++) { // rows (last row should always be empty, that's why we skip it)
        for (let j = 0; j < serverData[0].length; j++) { // columns
            if (columnLengths[j] === undefined) columnLengths[j] = 0; // we initialize the column length if it doesn't exist yet
            if (serverData[i][j].toString().length > columnLengths[j]) {
                // if the current value is longer than the current column length, we update the column length
                columnLengths[j] = serverData[i][j].toString().length; 
            }
        }
    }

    ns.tprint("Printing file: " + file);

    // Print data to terminal
    for (let i = 0; i < serverData.length-1; i++) { // rows
        let row = '';
        for (let j = 0; j < serverData[0].length; j++) { // columns
            // if the current column is included in the printColumns array, we print it. else we skip it
            if (printColumns.includes(serverData[0][j])) {
                if (j === 0) { // just for the pos. we want to have pad end, because we want to align the numbers to the left
                    // todo: somehow this line doesn't work as expected. The numbers are not aligned to the left but still to the right ... 
                    row += serverData[i][j].toString().padEnd(columnLengths[j] + 2, ' '); 
                } else { // for all other columns we want to align everything to the right
                    row += serverData[i][j].toString().padStart(columnLengths[j] + 2, ' ');
                }
            }
        }
        ns.tprint(row);
    }
}