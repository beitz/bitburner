/** @param {NS} ns **/

export async function main(ns) {
    // lets try the ns.prompt() function and see what it can do

    // from documentation:
    // prompt(
    //     txt: string,
    //     options?: { type?: "boolean" | "text" | "select"; choices?: string[] },
    //   ): Promise<boolean | string>;

    // lets try a simple prompt
    let result = await ns.prompt('Do you want to continue?');
    ns.tprint(`Result: ${result}`);

    // lets try a prompt with options
    let options = { type: 'select', choices: ['yes', 'no', 'maybe'] };
    result = await ns.prompt('Do you want to continue?', options);
    ns.tprint(`Result: ${result}`);

    // lets try a prompt with options and type text
    options = { type: 'text' };
    result = await ns.prompt('Enter your name:', options);
    ns.tprint(`Result: ${result}`);

    // conclusion: Results look promising. I'll probably just have to parse the string to the correct type
}
