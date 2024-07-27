import pandas as pd
import plotly.express as px
import os

# Get the directory of the current script and the data file
script_dir = os.path.dirname(os.path.abspath(__file__))
data_file_path = os.path.join(script_dir, 'servers.txt')

# Load the data
data = pd.read_csv(data_file_path, delimiter='|')

# Available headings in file
# 'date time', 'pos.', 'scanned', 'hostname', 'hasAdminRights', 'numOpenPortsRequired', 
# 'maxRam', 'ramUsed', 'purchasedByPlayer', 'moneyAvailable', 'moneyMax', 'hackDifficulty', 
# 'minDifficulty', 'currentHackingLevel', 'requiredHackingSkill', 'depth', 'files', 'hackable'

# Create a plot that does the following:
# x-axis: 'date time'
# y-axis: 'moneyAvailable'
# series: 'hostname'
fig = px.line(data, x='date time', y='moneyAvailable', color='hostname')

# Show the plot
fig.show()