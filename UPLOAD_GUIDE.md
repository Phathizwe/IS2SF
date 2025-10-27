# Upload Guide - Stocks & Flows Modeler

## Overview

The Stocks & Flows Modeler now supports automatic model generation from your financial documents! You can upload either:

1. **Annual Report PDF** - AI will extract income statement data
2. **Excel/CSV Income Statement** - Structured template format

## Method 1: Excel/CSV Template (Recommended)

### Step 1: Download Template

1. Click the **"Upload Report"** button in the toolbar
2. In the dialog, click **"Download Template"** under the Excel/CSV section
3. A file named `income-statement-template.csv` will be downloaded

### Step 2: Fill in Your Data

Open the CSV file in Excel, Google Sheets, or any spreadsheet application. The template has three sections:

**Revenue Section:**
- Product Sales
- Service Revenue
- Other Revenue

**Cost of Sales Section:**
- Direct Materials
- Direct Labor
- Manufacturing Overhead

**Expenses Section:**
- Salaries & Wages
- Rent
- Utilities
- Marketing & Advertising
- Insurance
- Depreciation
- Interest Expense
- Other Operating Expenses

Enter your actual amounts in the "Amount" column. You can:
- Add new rows following the same format
- Delete rows you don't need
- Modify labels to match your business

### Step 3: Upload Filled Template

1. Save your completed spreadsheet as CSV
2. Click **"Upload Report"** button
3. Click **"Upload Filled Template"**
4. Select your CSV file

The system will automatically:
- Parse your income statement data
- Create stocks for each line item
- Generate appropriate flows
- Link income statement to stocks
- Position everything on the canvas

## Method 2: Annual Report PDF

### Requirements

- PDF must contain a clear income statement section
- Text must be extractable (not scanned images)
- Works best with standard financial report formats

### Upload Process

1. Click **"Upload Report"** button
2. Click **"Upload PDF"** under Annual Report section
3. Select your PDF file
4. AI will analyze and extract financial data
5. Model will be automatically generated

### What the AI Extracts

The AI looks for:
- Revenue line items and amounts
- Cost of goods sold / Cost of sales
- Operating expenses
- Company name (if available)

## Generated Model Structure

After upload, the system creates:

### Stocks
- One stock for each income statement line item
- Initial value set to the amount from your data
- Positioned automatically on canvas
- Color-coded by type (Revenue: green, COGS: orange, Expenses: red)

### Flows
- Inflows for revenue items (from external source)
- Outflows for COGS and expenses (to external sink)
- Flow rates calculated as daily amounts (annual amount / 365)
- Appropriate rate types assigned

### Income Statement Panel
- All line items populated
- Linked to corresponding stocks
- Automatic calculation of totals, gross profit, and net income

## Tips for Best Results

1. **Use the CSV template** for most accurate results
2. **Include all significant line items** from your income statement
3. **Use annual amounts** - the system converts to daily rates
4. **Review and adjust** after generation - you can edit everything
5. **Save your work** using the Export button

## Example CSV Format

```csv
Section,Line Item,Amount
Revenue,Product Sales,500000
Revenue,Service Revenue,250000
Cost of Sales,Direct Materials,150000
Cost of Sales,Direct Labor,100000
Expenses,Salaries & Wages,120000
Expenses,Rent,24000
```

## Troubleshooting

**CSV Upload Fails:**
- Ensure file is saved as CSV format
- Check that columns are: Section, Line Item, Amount
- Verify amounts are numbers (no currency symbols)

**PDF Upload Fails:**
- Try the CSV template instead
- Ensure PDF has extractable text
- Check that income statement is clearly labeled

**Generated Model Looks Wrong:**
- You can manually edit all stocks, flows, and income statement items
- Use the Properties panel to adjust values
- Drag stocks to reposition them
- Click flows to edit their properties

## After Upload

Once your model is generated, you can:

1. **Simulate** - Click Play to see how values change over time
2. **Edit** - Click any stock or flow to modify properties
3. **Add More** - Use "Add Stock" and "Add Flow" buttons
4. **Export** - Save your model as JSON
5. **Create Checkpoint** - Save your work (if using web-db-user version)

## Support

For issues or questions, refer to the main README.md or submit feedback through the application.

