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
|  |  |  |

Not used anymore

| File | Status | Description |
| --- | --- | --- |
| hack.js | done | Script used to hack a target server. Uses a bit more code to be more efficient and give some nice log data. Lots of that probably not useful anymore though. |
| hack_simple.js | done | Simple script for hacking a server for the very early game. Should probably not be used, as there are better options. |
|  |  |  |

## Current workflow

1. start scanning with `periodic_scan.js`
1. run `manager.js`. This should take care of everything unless I forgot about something. 
    - will periodically (currently every 1 hour) run several scripts. 
    - scans the network and updates the servers.txt file that stores the server relevant data
    - determines how to distribute the available ram on purchased servers and home server and hacks those servers that are hackable in the network
    - automatically nukes them
1. create programs to open ports whenever available