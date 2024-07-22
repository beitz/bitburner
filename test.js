/** @param {NS} ns **/

export async function main(ns) {
    // Define the expected flags
    var flags = ns.flags([
        ['t', false], // -t flag. if true then print to terminal instead of writing to file
    ]);

    ns.tprint(flags);

    // Get the number of threads from the -t flag
    // var threads = flags.t;

    // Get the server to hack from the arguments
    // var server = ns.args[0];

    // Log the number of threads and the server to hack
    // ns.tprint(`Hacking ${server} with ${threads} threads.`);
}
