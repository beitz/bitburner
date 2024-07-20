/** @param {NS} ns **/

export async function main(ns) {
    // Define the expected flags
    const flags = ns.flags([
        ['t', 1], // -t flag with default value 1
    ]);

    // Get the number of threads from the -t flag
    const threads = flags.t;

    // Get the server to hack from the arguments
    const server = ns.args[0];

    // Log the number of threads and the server to hack
    ns.tprint(`Hacking ${server} with ${threads} threads.`);
}
