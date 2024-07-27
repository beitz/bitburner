import os
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# Get the directory of the current script and the data file
script_dir = os.path.dirname(os.path.abspath(__file__))
data_file_path = os.path.join(script_dir, 'servers.txt')

# Load the data
data = pd.read_csv(data_file_path, delimiter='|')

# Available headings in file
# 'date time', 'pos.', 'scanned', 'hostname', 'hasAdminRights', 'numOpenPortsRequired', 
# 'maxRam', 'ramUsed', 'purchasedByPlayer', 'moneyAvailable', 'moneyMax', 'hackDifficulty', 
# 'minDifficulty', 'currentHackingLevel', 'requiredHackingSkill', 'depth', 'files', 'hackable'

# Get unique hostnames and sort them alphabetically
sorted_hostnames = sorted(data['hostname'].unique())

# Define the options for the dropdown menu
y_axis_options = ['moneyAvailable', 'moneyMax', 'hasAdminRights', 'numOpenPortsRequired', 
                  'maxRam', 'ramUsed', 'hackDifficulty', 'minDifficulty', 'currentHackingLevel', 
                  'requiredHackingSkill']

# Create the plot
fig = px.line(data, x='date time', y='moneyAvailable', color='hostname', 
              category_orders={'hostname': sorted_hostnames})

# Create the dropdown menu
updatemenus = [
    {
        'buttons': [
            {
                'method': 'update',
                'label': y,
                'args': [
                    {'y': [data[data['hostname'] == hostname][y] for hostname in sorted_hostnames]},
                    {'yaxis': {'title': y}}
                ]
            } for y in y_axis_options
        ],
        'direction': 'down',
        'showactive': True,
    }
]

# Update the layout to include the dropdown menu
fig.update_layout(
    updatemenus=updatemenus,
    yaxis_title='moneyAvailable'  # Set the initial y-axis title
)

# Show the plot
fig.show()