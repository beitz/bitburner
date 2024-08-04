/** @param {NS} ns **/

/**
 * This is a collection of commonly used functions. 
 */

export function readData(ns, file) { // function to read 2d array from a file
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

export function writeData(ns, file, data, mode = "w") { // function to write 2d array to a file
    let formattedData = ''; // data we will write to the file

    // check if is 2d array
    if (Array.isArray(data) && Array.isArray(data[0])) {
        // we have a 2d array and everything is fine, so we can write the contents
        for (let row = 0; row < data.length; row++) { // rows
            for (let col = 0; col < data[i].length; col++) { // columns
                // lines are separated by a newline character, columns are separated by a | character
                if (col === data[row].length - 1) {
                    formattedData += data[row][col] + '\n';
                } else {
                    formattedData += data[row][col] + '|';
                }
            }
        }
    } else {
        ns.tprint(`Error 44526: Data is not a 2d array. Data: ${data}`);
        return;
    }

    ns.write(file, formattedData, mode);
}
