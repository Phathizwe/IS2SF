# Project TODO

- [x] Design interactive canvas for stocks and flows diagram
- [x] Implement stock nodes (rectangles representing accumulations)
- [x] Implement flow connections (arrows with valves)
- [x] Add drag-and-drop functionality for nodes
- [x] Create node editing panel for parameters
- [x] Implement simulation engine for stocks and flows
- [x] Add time-based simulation controls (play, pause, reset)
- [x] Create visual feedback for stock levels during simulation
- [x] Add ability to save and load models
- [x] Design responsive UI with modern styling
- [x] Add example templates for common business models
- [x] Implement export functionality (diagram as JSON)


- [x] Add ability to click and select flows on the canvas
- [x] Show flow properties in properties panel when flow is selected


- [x] Fix flow rates to be proportional to source stock quantity
- [x] Prevent flows from exceeding available stock in source


- [x] Create income statement panel on left side of interface
- [x] Add ability to link income statement line items to stocks
- [x] Implement income statement structure (Income section with Revenue, COGS, Gross Profit)
- [x] Implement expenses section with multiple expense categories
- [x] Calculate and display totals automatically
- [x] Create default business template with income statement


- [x] Create Excel income statement template for download
- [x] Add upload button for annual report PDF
- [x] Add upload button for Excel income statement
- [x] Use AI to extract financial data from PDF annual reports
- [x] Parse Excel files to extract income statement data
- [x] Automatically populate income statement panel from uploaded data
- [x] Automatically generate stocks and flows from income statement data
- [x] Create intelligent mapping between income statement items and stock types


- [x] Fix PDF parsing to handle real financial statements
- [x] Improve text extraction from PDF files
- [x] Enhance AI prompt for better financial data extraction


- [x] Fix PDF parsing failure for Santam financial statement
- [x] Test and validate AI extraction with real PDF file


- [x] Fix API authentication error (401) in PDF parser - Added better error handling and user guidance
- [x] Fix React ref warning in Dialog component


- [x] Fix environment variables not being accessible in client-side code for PDF parsing - Removed PDF upload feature, Excel/CSV template is now the only method


- [x] Add "Extract from PDF" button to extract income statement from annual reports
- [x] Create CSV template from extracted PDF data for user review before upload


- [x] Improve PDF parsing to better detect income statement sections in annual reports
- [x] Test with Santam financial statement PDF



## New Feature: Business Health Dashboard Platform

- [x] Create new landing page with annual report upload as primary entry point
- [x] Dashboard 1: Condensed Profit & Loss (P&L) with custom periods (YTD, trailing 12 months, annual, quarterly, monthly)
- [x] Dashboard 2: Balance Sheet (Assets, Liabilities, Owner's Equity)
- [ ] Dashboard 3: Statement of Cash Flows (Operating, Investing, Financing activities)
- [ ] Dashboard 4: Three-Statement Model (P&L, Balance Sheet, Cash Flows stacked)
- [ ] Dashboard 5: Comparison Financials (Current vs Prior Period/Year with delta and % variance)
- [ ] Dashboard 6: KPI Dashboard (8 key metrics with conditional formatting)
- [ ] Dashboard 7: Budget vs Actuals Report with variance analysis
- [ ] Dashboard 8: Cash Runway Dashboard (projected cash out date with visual alerts)
- [ ] Dashboard 9: Margins Dashboard (Revenue, Trailing 12 months, all margins)
- [ ] Dashboard 10: Non-GAAP Metrics Dashboard (MRR, SaaS metrics, custom metrics)
- [ ] Create navigation from dashboards to stocks & flows modeler
- [ ] Extract financial data from uploaded annual reports to populate dashboards
- [ ] Add period selector (month, quarter, YTD, trailing 12 months, annual)
- [ ] Implement conditional formatting for positive/negative variances
- [ ] Add doughnut charts for budget variance visualization

