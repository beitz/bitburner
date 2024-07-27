/** @param {NS} ns **/

// script is designed to be copied to target server and run locally by remote.js

// usage:
// run r_grow.js target

export async function main(ns) {
    // growing the server
    await ns.grow(ns.args[0]);
}
