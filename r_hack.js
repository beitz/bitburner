/** @param {NS} ns **/

// script is designed to be copied to target server and run locally by remote.js

// usage:
// run r_hack.js target

export async function main(ns) {
    // hacking the server
    await ns.hack(ns.args[0]);
}
