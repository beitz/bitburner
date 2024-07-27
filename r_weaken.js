/** @param {NS} ns **/

// script is designed to be copied to target server and run locally by remote.js

// usage:
// run r_weaken.js target

export async function main(ns) {
    // weakening the server
    await ns.weaken(ns.args[0]);
}
