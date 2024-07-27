/** @param {NS} ns **/

export async function main(ns) {
    let interval; // scanning interval in seconds

    // try to get list of files from server and print it to terminal for testing
    if (ns.args.length === 1) {
        let arg = ns.args[0];
        let lastChar = arg.charAt(arg.length - 1);
        if (lastChar === 's') {
            interval = parseInt(arg);
        } else if (lastChar === 'm') {
            interval = parseInt(arg) * 60;
        } else {
            interval = parseInt(arg);
        }
    } else {
        // if no argument is given, default to 60 seconds
        interval = 60;
    }

    ns.tprint(`interval: ${interval}`);
}
