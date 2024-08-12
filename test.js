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
    // let contract = ns.codingcontract.createDummyContract("Array Jumping Game");
    // contract = ns.codingcontract.createDummyContract("Array Jumping Game II");
    // contract = ns.codingcontract.createDummyContract("Find Largest Prime Factor");
    // contract = ns.codingcontract.createDummyContract("Total Ways to Sum");
    // contract = ns.codingcontract.createDummyContract("Total Ways to Sum II");
    // contract = ns.codingcontract.createDummyContract("Shortest Path in a Grid");

    // let gangNames = ns.Gang.getMemberNames();

    // check if we have enough RAM to execute the script
    let freeRam = ns.getServerMaxRam('home') - ns.getServerUsedRam('home');
    let scriptRam = ns.getScriptRam("contracts/Generate_IP_Addresses.js", 'home');
    ns.tprint(`freeRam: ${freeRam}, scriptRam: ${scriptRam}`);
    if (freeRam < scriptRam) {
        ns.tprint(`Error 8715: Not enough free RAM to execute script: ${contractScriptFile}. We have ${Math.floor(freeRam)} RAM available, but we need ${scriptRam} RAM`);
        return;
    }
}
