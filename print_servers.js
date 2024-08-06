/** @param {NS} ns **/

import { readData, debugPrint } from 'utils/utils.js';

/**
 * This script prints server information in the terminal in a nicely formatted way.
 * 
 * Usage: 
 * run print_servers.js print <args>
 * Arguments: 
 * - help: prints the usage of this script and shows what columns are available
 * - <column>: choose which columns to show. For boolean columns, you can add ':true' or ':false' to only show servers with that value.
 */

// todo: filtering rows doesn't work anymore. fix that. 
// todo: add ability to print purchased servers? 

const shortenedHeader = [
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
    // ------------------ check arguments ------------------
    const serversFile = "data/servers.txt";

    if (ns.args.length === 0 || ns.args[0] === 'help') {
        ns.tprint("Usage: run print_servers.js print <args>");
        ns.tprint("Arguments:");
        ns.tprint("help: prints the usage of this script and shows what columns are available");
        ns.tprint("<column>: choose which columns to show.");
        ns.tprint("          For boolean columns, you can add ':true' or ':false' to only show servers with that value.");
        ns.tprint("Available columns: " + shortenedHeader.map(x => x[0]).join(', '));
        return;
    } else if (!ns.args.includes('print')) {
        ns.tprint("Error 44793: No 'print' argument provided.");
        return;
    }
    let args = ns.args.filter(x => x !== 'print'); // remove 'print' from the arguments

    // ------------------ variables ------------------
    let serverData = readData(ns, serversFile); // 2d array with server data
    parseArgs(args); // add default column if empty
    let printColumnData = parseColumns(args); // 2d array with |printColumns|filters|type|

    // ------------------ main ------------------
    addTreeStructure(serverData);
    filterColumns(serverData, printColumnData);
    filterRows(serverData, printColumnData);
    formatServerData(serverData, shortenedHeader); // replace headers with shortened headers and format data
    let columnLengths = getColumnLengths(ns, serverData); // 1d array with the max length of each column
    printServerData(ns, serverData, printColumnData, columnLengths, shortenedHeader); // print the filtered server data to terminal
}

// ------------------ functions ------------------
function parseArgs(args) { // takes 1d array with arguments and adds default column headers if empty
    // if 'hostname' is not provided, add it
    if (!args.includes('hostname')) {
        args.unshift('hostname');
    }

    // if we only have hostname as the only argument, we add some default columns
    if (args.length === 1) {
        args.push('hasAdminRights');
        args.push('numOpenPortsRequired');
        args.push('maxRam');
        args.push('ramUsed');
        args.push('purchasedByPlayer');
        args.push('moneyMax');
        args.push('requiredHackingSkill');
        args.push('hackable');
        args.push('moneyPercent');
    }
}

function parseColumns(args) { // takes 1d array of arguments and returns 2d array with |printColumns|filters|
    // we take a 1d array with arguments
    // those arguments can look like this `['hostname', 'hasAdminRights:true', 'numOpenPortsRequired', etc.]`
    // we split each item in the array by ':' and check if the second part is a boolean value. If it is, we add it to the second column. 
    // we add the type to the third column, e.g. 'boolean' or 'number'

    let columnData = [];

    for (let row = 0; row < args.length; row++) {
        let column = args[row].split(':');
        let columnName = column[0];
        let columnValue = parseValue(column[1]);
        let columnType = typeof columnValue;

        columnData.push([columnName, columnValue, columnType]);
    }

    return columnData;
}

function addTreeStructure(serverData) { // takes 2d array with server data and adds tree structure to the hostname column
    let verticalLine = '│';
    let cornerLine = '└';
    let siblingLine = '├';
    let horizontalLine = '─';

    for (let row = 1; row < serverData.length - 1; row++) {
        let hostname = serverData[row][serverData[0].indexOf('hostname')];
        let thisRowDepth = serverData[row][serverData[0].indexOf('depth')];
        let nextRowDepth = serverData[row + 1][serverData[0].indexOf('depth')];

        let tree = '';

        for (let i = 0; i < thisRowDepth; i++) {
            tree += verticalLine + ' ';
        }

        if (thisRowDepth > nextRowDepth) {
            tree += cornerLine + horizontalLine;
        } else {
            tree += siblingLine + horizontalLine;
        }

        serverData[row][serverData[0].indexOf('hostname')] = tree + hostname;
    }
}

function filterColumns(serverData, printColumnData) { // takes 2d array with server data and removes unused columns
    // ------------------ remove columns ------------------
    // we create a 1d array that contains the columns we want to remove
    let columnsToRemove = [];
    for (let i = 0; i < serverData[0].length - 1; i++) { // for each column in the header row
        let serverColumnName = serverData[0][i];
        let removeColumn = true;

        for (let j = 0; j < printColumnData.length; j++) { // we compare each value with each of the filter values
            let columnName = printColumnData[j][0];

            if (serverColumnName === columnName) { // if the column name is the same as the filter column name
                removeColumn = false; // we found the column, so we keep it
                continue; // we found the column, so we keep it
            }
        }
        if (removeColumn) { // remove column
            columnsToRemove.push(i); // add the column index to the columnsToRemove array
        }
    }

    // now we remove the columns from the serverData array
    for (let row = 0; row < serverData.length - 1; row++) {
        for (let i = columnsToRemove.length; i >= 0; i--) {
            serverData[row].splice(columnsToRemove[i] - 1, 1);
        }
    }
}

function filterRows(serverData, printColumnData) { // takes 2d array with server data and removes unused rows
    // ------------------ filter rows ------------------
    for (let row = serverData.length - 1; row >= 1; row--) { // go through each row ...
        let removeRow = false;

        for (let col = 0; col < serverData[0].length; col++) { // ... and each column of the server Data
            let serverColumnName = serverData[0][col];
            let printColumnRow = printColumnData.find(x => x[0] === serverColumnName);

            if (printColumnRow) { // check if we found the column header in the printColumnData array
                let columnType = printColumnRow[2];

                if (columnType === 'boolean') { // if the column type is boolean
                    // check if the column value is the same as the filter value, if yes keep it, if not remove the row
                    if (parseValue(serverData[row][col]) !== parseValue(printColumnRow[1])) {
                        removeRow = true; // we found a row that we want to remove
                        continue;
                    }
                }
                // todo: add the same logic for numbers
            } else {
                removeRow = true; // we remove the row
            }
        }
        if (removeRow) {
            serverData.splice(row, 1); // remove the row
        }
    }
}

function parseValue(value) { // takes a value and returns the value as a boolean or number
    if (value === 'true' || value === true) {
        return true;
    }
    if (value === 'false' || value === false) {
        return false;
    }
    if (!isNaN(value)) {
        return parseFloat(value);
    }
    return value;
}

function formatServerData(serverData, shortenedHeader) { // takes 2d array with server data and replaces headers with shortened headers and formats data
    for (let row = 0; row < serverData.length; row++) {
        for (let col = 0; col < serverData[0].length; col++) {
            // if the column header is found in the shortenedHeader array, we replace the header with the shortened header
            for (let i = 0; i < shortenedHeader.length; i++) {
                if (serverData[0][col] === shortenedHeader[i][0]) {
                    serverData[0][col] = shortenedHeader[i][1];
                }
            }

            // if we're in the data rows (not the header row), we format the data
            if (row > 0) {
                // if the value has more than 4 significant digits, we format it to a string with 4 significant digits. e.g. 5.123e+6
                if (typeof serverData[row][col] === 'number' && serverData[row][col].toString().length > 4) {
                    serverData[row][col] = parseFloat(serverData[row][col]).toExponential(1);
                } else if (serverData[row][col] === 'true' || serverData[row][col] === true) {
                    serverData[row][col] = "✔";
                } else if (serverData[row][col] === 'false' || serverData[row][col] === false) {
                    serverData[row][col] = " "; // alternative "✘"
                }
            }
        }
    }
}

function getColumnLengths(ns, serverData) { // takes 2d array with server data and returns 1d array with the max length of each column
    let columnLengths = [];

    for (let row = 0; row < serverData.length - 1; row++) {
        for (let col = 0; col < serverData[0].length; col++) {
            if (columnLengths[col] === undefined) columnLengths[col] = 0;
            if (serverData[row][col].toString().length > columnLengths[col]) { // <----- this serverData[row][col] is undefined?!
                columnLengths[col] = serverData[row][col].toString().length;
            }
        }
    }

    return columnLengths;
}

function printServerData(ns, serverData, columnData, columnLengths, shortenedHeader) { // prints the filtered server data to terminal
    ns.tprint("Printing server data with the following columns: " + columnData.map(x => x[0]).join(', '));

    let spacing = 2; // spacing between columns

    for (let row = 0; row < serverData.length - 1; row++) {
        let printedRow = '';
        for (let col = 0; col < serverData[0].length; col++) {
            if (getFullName(serverData[0][col], shortenedHeader) === 'hostname') { // for the hostname column we align left
                printedRow += serverData[row][col].toString().padEnd(columnLengths[col] + spacing, ' ');
            } else {
                printedRow += serverData[row][col].toString().padStart(columnLengths[col] + spacing, ' ');
            }
        }
        ns.tprint(printedRow);
    }
}

function getFullName(name, shortenedHeader) { // takes a short or full name and returns the full name
    for (let i = 0; i < shortenedHeader.length; i++) {
        if (shortenedHeader[i][1] === name) {
            return shortenedHeader[i][0];
        }
    }
    return name;
}