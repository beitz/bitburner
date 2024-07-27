/** @param {NS} ns **/

export async function main(ns) {
    // try to get list of files from server and print it to terminal for testing
    let server = 'home';
    let files = ns.ls(server);

    ns.tprint(files);
}
