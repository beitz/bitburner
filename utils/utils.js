/** @param {NS} ns **/

/**
 * This is a collection of commonly used functions. 
 */

export function readData(ns, file) { // function to read the data from a file
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