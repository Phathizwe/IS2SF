# Business Stocks & Flows Modeler

An interactive web application that helps companies model their business using stocks and flows diagrams with real-time simulation capabilities.

## Overview

The Stocks & Flows Modeler is a powerful tool for visualizing and simulating business processes using system dynamics principles. It allows users to create interactive models with stocks (accumulations) and flows (rates of change) to understand how different business variables interact over time.

## Features

### Core Functionality

**Interactive Canvas**: A drag-and-drop canvas where you can create and arrange stocks and flows to model your business processes.

**Stock Nodes**: Rectangular nodes representing accumulations in your system, such as customers, inventory, cash, or any quantifiable resource. Each stock displays its current value and includes a visual indicator showing the fill level.

**Flow Connections**: Arrows representing the rate of change between stocks or from external sources. Flows can connect stocks together or represent inflows from external sources and outflows to external sinks.

**Real-Time Simulation**: Play, pause, and reset controls allow you to simulate your model over time and observe how stock levels change based on the defined flows.

**Properties Panel**: Select any stock or flow to edit its properties including name, initial values, flow rates, and colors for easy visual distinction.

### Advanced Features

**Template Library**: Pre-built templates for common business models including customer growth, inventory management, and cash flow modeling. Load a template to get started quickly.

**Import/Export**: Save your models as JSON files and share them with colleagues or load them later for further refinement.

**Drag-and-Drop**: Freely position stocks on the canvas by dragging them to create clear and organized diagrams.

**Visual Feedback**: Stock nodes include progress bars that visualize the current value relative to the initial value, making it easy to see changes at a glance.

## How to Use

### Creating a New Model

1. Click **Add Stock** to create a new stock node on the canvas
2. Click on the stock to select it and edit its properties in the right panel
3. Set the stock's name, initial value, and color
4. Click **Add Flow** to create a flow between stocks
5. In the flow dialog, select the source and target stocks (or choose external source/sink)
6. Set the flow rate and color

### Running Simulations

1. Click **Play** to start the simulation
2. Watch as stock values change over time based on the flow rates
3. Click **Pause** to stop the simulation at any point
4. Click **Reset** to return all stocks to their initial values

### Using Templates

1. Click **Templates** in the toolbar
2. Choose from pre-built models like Customer Growth, Inventory Management, or Cash Flow
3. The template will load with example stocks and flows
4. Customize the template by editing properties or adding new elements

### Saving and Loading

1. Click **Export** to download your model as a JSON file
2. Click **Import** to load a previously saved model
3. Models can be shared with team members for collaborative planning

## Example Use Cases

### Customer Growth Model

Model customer acquisition and retention by tracking prospects flowing into customers, with marketing driving new prospects and churn reducing the customer base.

### Inventory Management

Track materials through your production pipeline from raw materials through work-in-progress to finished goods, with procurement, production, and sales flows.

### Cash Flow Analysis

Monitor cash positions by modeling revenue flowing into accounts receivable, collections converting receivables to cash, and operating expenses depleting cash reserves.

## Technical Details

This application is built with modern web technologies including React, TypeScript, and Canvas API for rendering. The simulation engine uses discrete-time integration to update stock values based on flow rates.

## Tips for Effective Modeling

- Start simple with just a few stocks and flows, then add complexity as needed
- Use descriptive names for stocks and flows to make your model self-documenting
- Choose distinct colors for different types of stocks and flows
- Test your model with different flow rates to understand system behavior
- Export and version your models as you refine them

## Support

For questions, feedback, or feature requests, please contact the development team.

