/** @param {NS} ns */

// this is a test script to test the read and write functions

// the rows in the file are separated with newline characters, i.e. "\n"
// the columns in the file are separated with "|" characters

export async function main(ns) {
    var file = "moneyThresholds.txt";
    var moneyThresholdsFile = "moneyThresholds.txt";
  
    // this function will read the data from the file and return a 2d array with servers in the first column and thresholds in the second column
    function readData(file) {
        let data = ns.read(file);
        if (data === "") {
          return [];
        }
        // Remove all carriage return characters
        data = data.replace(/\r/g, "");
        return data.split("\n").map(row => {
          const columns = row.split("|");
          // Assuming the second column should be converted to a number
          columns[1] = parseFloat(columns[1]);
          return columns;
        });
      }
  
    // this function will take the 2d array and write it to the file
    function writeData(file, data) {
      let dataStr = data.map(row => row.join("|")).join("\n");
      ns.write(file, dataStr, "w");
    }

    // this function will try to find the target server within the provided 2d array (should be first item in the column) and return the value from the second column if something is found
    // if nothing is found just return 0
    function findThreshold(server, data) {
      for (let i = 0; i < data.length; i++) {
        if (data[i][0] === server) {
          return data[i][1];
        }
      }
      return 0;
    }

    // this function will add a row to the 2d array if the server is not already in the array
    function addThreshold(server, threshold, data) {
        // if we already have the data, we don't add it again
        if (findThreshold(server, data) == 0) {
            ns.tprint("adding server");
            data.push([server, threshold]);
        } else {
            ns.tprint("server already exists");
        }
    }
  
    ns.tprint("Reading data from file");
    var moneyThresholdData = readData(moneyThresholdsFile);
    ns.tprint(moneyThresholdData);
    let test = findThreshold("foodnstuff", moneyThresholdData);
    ns.tprint(test);
    addThreshold("sigma-cosmetics", 0.74, moneyThresholdData);
    writeData(moneyThresholdsFile, moneyThresholdData);
  }