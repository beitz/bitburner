/** @param {NS} ns **/

// todo: filter rows before building tree structure. also make sure we print the parent if we have children, even if it is filtered out
// todo: maybe highlight the things we filtered out instead of filtering out everything else. This way we can still see the tree structure. 

let printColumns = [];
let filterColumns = [];
let shortenedHeader = [
    ['date time', 'time'],
    ['pos.', 'pos.'],
    ['scanned', 'scanned?'],
    ['hostname', 'name'],
    ['hasAdminRights', 'A'],
    ['numOpenPortsRequired', 'P'],
    ['maxRam', 'mRAM'],
    ['ramUsed', 'RAM'],
    ['purchasedByPlayer', 'purchased?'],
    ['moneyAvailable', '$'],
    ['moneyMax', 'max $'],
    ['hackDifficulty', 'security'],
    ['minDifficulty', 'min security'],
    ['currentHackingLevel', 'hack lvl'],
    ['requiredHackingSkill', 'req. hack lvl'],
    ['depth', 'depth'],
    ['files', 'files'],
    ['hackable', 'hackable?'],
    ['serverGrowth', 'serverGrowth'],
    ['Cores', 'Cores'],
    ['moneyPercent', 'money%']
];

export async function main(ns) {
    const file = "data/servers_current.txt";

    // if the first argument is 'help' we print the usage of this script
    if (ns.args[0] === 'help') {
        ns.tprint("Usage: run print_servers.js <args>");
        ns.tprint("Arguments choose which columns to show. The following columns are available:");
        ns.tprint("date time, pos., scanned, hostname, hasAdminRights, numOpenPortsRequired, maxRam, " + 
            "ramUsed, purchasedByPlayer, moneyAvailable, moneyMax, hackDifficulty, minDifficulty, " + 
            "currentHackingLevel, requiredHackingSkill, depth, files, hackable, serverGrowth, " +
            "Cores, moneyPercent");
        // todo: add the functionality to do some simple parsing for filtering as well
        //       e.g. "depth<5" to only show servers with a depth of less than 5
        //       e.g. "moneyAvailable>1e6" to only show servers with more than 1e6 money available
        //       e.g. "hasAdminRights:true" to only show servers with admin rights
        //       etc. 
        //       should support : > < >= <= == != as operators. : for boolean values, rest for numbers
        return;
    } else if (ns.args.length > 0) {
        printColumns = ['hostname']; // we always want to print the hostname
        for (let i = 0; i < ns.args.length; i++) {
            printColumns.push(ns.args[i]);
        }
    } else {
        printColumns = ['hostname', 'hasAdminRights', 'numOpenPortsRequired', 'maxRam', 'ramUsed', 'moneyMax', 'requiredHackingSkill', 'hackable']; // default columns
    }

    // we go throught the filter column. If we find any args with an operator (e.g. > < >= <= == !=) we add them to 
    //  the filterColumns array and remove the operator and value from the printColumns array
    for (let i = 0; i < printColumns.length; i++) {
        if (printColumns[i].includes(':')) {
            filterColumns.push(printColumns[i]);
            printColumns[i] = printColumns[i].split(":")[0];
        }
    }

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

    function shortenHeader(header, shortenedHeader) {
        // header: string with the name of the column in its original version
        // shortenedHeader: 2d array with long and short names for the columns
        // function looks if the header is in the shortenedHeader array and returns the short name if it is, else it returns the original name
        for (let i = 0; i < shortenedHeader.length; i++) {
            if (header === shortenedHeader[i][0]) {
                return shortenedHeader[i][1];
            } else {
                return header;
            }
        }
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
            if (serverData[i][j] === 'true' || serverData[i][j] === true) {
                serverData[i][j] = "✔";
            } else if (serverData[i][j] === 'false' || serverData[i][j] === false) {
                serverData[i][j] = " "; // alternative "✘"
            }
        }
    }

    // we find the index of the column with the name 'depth' and 'hostname'
    let depthColumn = serverData[0].indexOf('depth');
    let hostnameColumn = serverData[0].indexOf('hostname');
    let nextRowDepth, thisRowDepth;

    // merging the first two columns (pos. and hostname) into one column and replacing pos with the tree like structure
    for (let i = 1; i < serverData.length-1; i++) { // rows (last row should always be empty, that's why we skip it)
        thisRowDepth = serverData[i][depthColumn]
        if (i+1 <= serverData.length) {
            nextRowDepth = serverData[i+1][depthColumn]
        } else {
            break;
        }

        // So, there are several cases that can occur here:
        // 1. The depth of the current row is more than the depth of the next row (e.g. last child of a parent). In this case we print '└'
        // 2. The depth of the current row is less than the depth of the next row (e.g. parent of a child). In this case we print '├'
        // 3. The depth of the current row is equal to the depth of the next row (e.g. sibling of a sibling). In this case we print '├'
        // We fill the empty spaces with '│' in the front
        
        // For each depth level, we add a '│' to the tree, unless it's the last depth level, in which case we add a ' ' to the tree
        let tree = '';
        let verticalLine = '│';
        let cornerLine = '└';
        let siblingLine = '├';
        let horizontalLine = '─';

        for (let j = 0; j < thisRowDepth; j++) {
            tree += verticalLine + ' ';
        }

        if (thisRowDepth > nextRowDepth) {
            tree += cornerLine + horizontalLine;
        } else {
            tree += siblingLine + horizontalLine;
        }

        // we replace the hostname column with the tree like structure and add the name to it
        serverData[i][hostnameColumn] = tree + serverData[i][hostnameColumn];
    }

    // // we change the name of some of the headings of the header row to shorten the names
    // let headerRow = serverData[0];
    // for (let i = 0; i < headerRow.length; i++) {
    //     switch (headerRow[i]) {
    //         case 'hasAdminRights':
    //             headerRow[i] = 'A';
    //             if (printColumns.includes('hasAdminRights')) printColumns.push('A');
    //             break;
    //         case 'numOpenPortsRequired':
    //             headerRow[i] = 'P';
    //             if (printColumns.includes('numOpenPortsRequired')) printColumns.push('P');
    //             break;
    //         case 'maxRam':
    //             headerRow[i] = 'ram';
    //             if (printColumns.includes('maxRam')) printColumns.push('ram');
    //             break;
    //         case 'moneyAvailable':
    //             headerRow[i] = 'money';
    //             if (printColumns.includes('moneyAvailable')) printColumns.push('money');
    //             break;
    //         case 'moneyMax':
    //             headerRow[i] = 'max money';
    //             if (printColumns.includes('moneyMax')) printColumns.push('max money');
    //             break;
    //         case 'requiredHackingSkill':
    //             headerRow[i] = 'hack';
    //             if (printColumns.includes('requiredHackingSkill')) printColumns.push('hack');
    //             break;
    //     }
    // }

    // We determine the max length of each column
    let columnLengths = [];
    for (let i = 1; i < serverData.length-1; i++) { // rows (last row should always be empty, that's why we skip it. We also skip the first row, because it's the header row)
        for (let j = 0; j < serverData[0].length; j++) { // columns
            if (columnLengths[j] === undefined) columnLengths[j] = 0; // we initialize the column length if it doesn't exist yet
            if (serverData[i][j].toString().length > columnLengths[j]) {
                // if the current value is longer than the current column length, we update the column length
                columnLengths[j] = serverData[i][j].toString().length; 
            }
        }
    }
    // now we check the header row as well, but with the data from the shortened header
    for (let i = 0; i < shortenedHeader.length; i++) {
        if (shortenedHeader[i][1].length > columnLengths[i]) {
            columnLengths[i] = shortenedHeader[i][1].length;
        }
    }

    ns.tprint("Printing file: " + file + " with the following columns: " + printColumns.join(', '));

    // Print data to terminal
    for (let i = 0; i < serverData.length-1; i++) { // rows
        let row = '';
        for (let j = 0; j < serverData[0].length; j++) { // columns
            // if the current column is included in the printColumns array, we print it. else we skip it
            if (printColumns.includes(serverData[0][j])) {
                if (i === 0) { // for the header row we print the header row, but with the shortened headers
                    row += shortenedHeader[j][1].toString().padStart(columnLengths[j] + 2, ' ');
                } else {
                    if (j === hostnameColumn) { // just for the hostname column (where we have tree + name) we want to align left
                        row += serverData[i][j].toString().padEnd(columnLengths[j] + 2, '_'); 
                    } else { // for all other columns we want to align everything to the right
                        row += serverData[i][j].toString().padStart(columnLengths[j] + 2, ' ');
                    }
                }
            }
        }

        // some logic to determine if we should print the line or not
        let print_line = true;
        // we iterate through the list of all arguments that have one of the following operators: > < >= <= == != :
        for (let k = 0; k < ns.args.length; k++) {
            if (ns.args[k].includes(':')) { // for all arguments containing a : we check if the value is a boolean or not
                let arg = ns.args[k].split(':');
                let column = arg[0];
                let argValue = arg[1];
                let columnIndex = serverData[0].indexOf(column);
                let serverValue = serverData[i][columnIndex];

                if (argValue === 'true') {
                    if (serverValue !== 'true' && serverValue !== '✔') print_line = false;
                } else if (argValue === 'false') {
                    if (serverValue !== 'false' && serverValue !== ' ') print_line = false;
                }
            }
        }
        if (print_line || i === 0) ns.tprint(row);
    }
}