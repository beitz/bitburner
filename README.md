# Bitburner Scripts
Here are some of my personal scripts for Bitburner that I wrote using NS2. 

## Files
| File | Status | Description |
| --- | --- | --- |
| hack_all.js | done for now | Run to nuke/hack all servers in network where possible.  |
| hack_simple_2.js | done | Hack script specifically made to be copied onto a server and run there locally to hack the server. Run by another script (hack_all.js). |
| hack_simple_3.js | done | Hack script specifically made to be copied onto a server and run there locally to hack the server. Run by manager.js. |
| manager.js | done | Script that always runs on the home server and manages all other scripts, our money, and all other things so we don't have to. |
| periodic_scan.js | done | Runs in the background, periodically scanning and logging server data for all servers in network. |
| print_servers.js | done | Used to print server data created by scan.js nicely formatted to the terminal. |
| purchase_hacknet.js | todo | Used to purchase and upgrade hacknet nodes |
| purchase_server.js | wip | Used to buy servers to have additional RAM for hacking |
| scan.js | done | Used to scan the network and log useful server data into a file. |
| test.js | never done | Script I use for testing stuff. |
| connect.js | done | script that lets us connect quickly to any server in the entire network. |
| contracts.js | wip | list or do all kinds of contracts that can be found on all the servers. |
|  |  |  |

Not used anymore

| File | Status | Description |
| --- | --- | --- |
| hack.js | done | Script used to hack a target server. Uses a bit more code to be more efficient and give some nice log data. Lots of that probably not useful anymore though. |
| hack_simple.js | done | Simple script for hacking a server for the very early game. Should probably not be used, as there are better options. |
|  |  |  |

## Current workflow

1. just run `manager.js`. This should take care of everything unless I forgot about something. 
    - will start periodic_scan.js if it isn't running already to create a log file for all servers and a lot of their stats. 
    - will periodically (currently every 1 hour) run several scripts. 
    - scans the network and updates the servers.txt file that stores the server relevant data
    - determines how to distribute the available ram on purchased servers and home server and hacks hackable target servers in the network
    - also automatically nukes them and opens ports
1. create programs to open ports whenever available
1. grind faction reputation to purchase augmentations when possible
1. List contracts with `run contracts.js list` and solve them with `contracts.js do 123456` where the number is the contract number. 

This way we will purchase servers with our money each hour. 
We will use the RAM on those servers + home server to hack all kinds of hackable targets in the network. 
Each hour we will scan the network again, kill all scripts and start hacking again with a new RAM distribution. 
Sometimes we'll have to `connect.js` to a specific server in the network to install a backdoor and gain a faction invitation. 
Then we'll do work for that faction to gain reputation and buy their augmentations. 
We install the augmentations. 
rinse and repeat. 

# General Info

Just some general information on the stuff I have here. I'll rewrite it at some point, but for now I'll just write down what I can before I forget. 
todo: rewrite all of this

- we periodically scan the whole network and save the data in `data/servers.txt`. This is the file that all other scripts read to get info. 
- all tables are saved as 2d arrays as files somewhere as `*.txt` files, because Bitburner only allows us to work with txt and js files. 
- all tables have `|` as their delimiter and start new lines with `\n`. 
- all tables have a header row, so we usually start indexing at 1 instead of 0. This way we can simply find the index of the header instead of working with a column number. 
- all functions can be called with no arguments, which should display help to the terminal

### workflow
until I rewrite all of this, here is the general workflow

1. Start `manager.js u:5` or so to execute all kinds of functions every 5 minutes in this case. This includes hacking of servers, either from home or on the target server itsels, nuking of servers, purchasing servers, solving contracts (wip), scanning the network to update server data, etc. 
1. Installing of backdoors is still manual
1. Join factions, farm their reputation, install augmentations

### file structure

1. `manager.js` runs in the background executing all other scripts: 
    1. `periodic_scan.js` is run at the beginning with an interval of 1 minute, if it isn't running already
        1. This will scan the network and overwrite the data to `data/servers.txt`. This is the file that other scripts will read to get the current server info. 
        1. This will also append to `data/servers_log.txt`. This is the log file that we can use for plotting. 
    1. `scan.js` is used to update the `data/servers.txt` file with new data. Useful after we have done something to the servers, e.g. started hacking on them, to get updated information on the servers. 
