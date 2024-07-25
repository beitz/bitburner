/** @param {NS} ns **/

export async function main(ns) {
    let print_rows = ns.args[0] || 100; // the number of rows to print

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
    const headerRow = serverData.shift();
    serverData = serverData.slice(-print_rows);

    // First we determine the max length of each column
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

    ns.tprint("");
    ns.tprint("Printing file: " + file);

    // Print the header
    ns.tprint(headerRow.join(' | '));

    // Print data to terminal
    for (let i = 0; i < serverData.length-1; i++) { // rows
        let row = '';
        for (let j = 0; j < serverData[0].length; j++) { // columns
            row += serverData[i][j].toString().padStart(columnLengths[j] + 2, ' ');
        }
        ns.tprint(row);
    }
}