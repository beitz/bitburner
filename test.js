/** @param {NS} ns **/

// contract types:
// ["Find Largest Prime Factor","Subarray with Maximum Sum","Total Ways to Sum","Total Ways to Sum II",
// "Spiralize Matrix","Array Jumping Game","Array Jumping Game II","Merge Overlapping Intervals",
// "Generate IP Addresses","Algorithmic Stock Trader I","Algorithmic Stock Trader II","Algorithmic Stock Trader III",
// "Algorithmic Stock Trader IV","Minimum Path Sum in a Triangle","Unique Paths in a Grid I","Unique Paths in a Grid II",
// "Shortest Path in a Grid","Sanitize Parentheses in Expression","Find All Valid Math Expressions",
// "HammingCodes: Integer to Encoded Binary","HammingCodes: Encoded Binary to Integer","Proper 2-Coloring of a Graph",
// "Compression I: RLE Compression","Compression II: LZ Decompression","Compression III: LZ Compression",
// "Encryption I: Caesar Cipher","Encryption II: Vigenère Cipher"]

export async function main(ns) {
    // let contract = ns.codingcontract.createDummyContract("Generate IP Addresses");

    // let purchasedServers = ns.getPurchasedServers();
    // ns.tprint(purchasedServers);

    // let processes = ns.ps('home');
    // for (let i = processes.length - 1; i >= 0; i--) {
    //     ns.tprint(processes[i]);
    //     ns.tprint(processes[i].pid);
    // }



    let processes = ns.ps('home');
    let currentManagerPID;

    // we looop through the processes on our home server from last to first. 
    // the first process with "manager" in the filename is the current script, we leave that alone. 
    // all other manager scripts will be killed
    ns.tprint(processes);
    for (let i = processes.length - 1; i >= 0; i--) {
        if (processes[i].filename.includes('manager') && !currentManagerPID) {
            currentManagerPID = processes[i].pid;
            ns.tprint(`not killing process ${processes[i].pid}`);
            continue;
        }
        if (processes[i].filename.includes('manager')) {
            // ns.kill(processes.pid);
            ns.tprint(`killing process ${processes[i].pid}`);
        }
    }
}
