export const ACCOUNT_TYPES = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

export const defaultAccounts = [
  // Assets
  { id: '1001', code: '1001', name: 'Cash', type: 'Asset', isDefault: true },
  { id: '1002', code: '1002', name: 'Bank Account', type: 'Asset', isDefault: true },
  { id: '1003', code: '1003', name: 'Accounts Receivable', type: 'Asset', isDefault: true },
  { id: '1004', code: '1004', name: 'Inventory', type: 'Asset', isDefault: true },
  { id: '1005', code: '1005', name: 'Prepaid Expenses', type: 'Asset', isDefault: true },
  { id: '1006', code: '1006', name: 'Fixed Assets', type: 'Asset', isDefault: true },
  { id: '1007', code: '1007', name: 'Accumulated Depreciation', type: 'Asset', isDefault: true },

  // Liabilities
  { id: '2001', code: '2001', name: 'Accounts Payable', type: 'Liability', isDefault: true },
  { id: '2002', code: '2002', name: 'Short-term Loans', type: 'Liability', isDefault: true },
  { id: '2003', code: '2003', name: 'Long-term Loans', type: 'Liability', isDefault: true },
  { id: '2004', code: '2004', name: 'Tax Payable', type: 'Liability', isDefault: true },
  { id: '2005', code: '2005', name: 'Accrued Liabilities', type: 'Liability', isDefault: true },

  // Equity
  { id: '3001', code: '3001', name: 'Owner Capital', type: 'Equity', isDefault: true },
  { id: '3002', code: '3002', name: 'Retained Earnings', type: 'Equity', isDefault: true },
  { id: '3003', code: '3003', name: 'Drawings', type: 'Equity', isDefault: true },

  // Revenue
  { id: '4001', code: '4001', name: 'Sales Revenue', type: 'Revenue', isDefault: true },
  { id: '4002', code: '4002', name: 'Service Revenue', type: 'Revenue', isDefault: true },
  { id: '4003', code: '4003', name: 'Other Income', type: 'Revenue', isDefault: true },

  // Expenses
  { id: '5001', code: '5001', name: 'Cost of Goods Sold', type: 'Expense', isDefault: true },
  { id: '5002', code: '5002', name: 'Salaries Expense', type: 'Expense', isDefault: true },
  { id: '5003', code: '5003', name: 'Rent Expense', type: 'Expense', isDefault: true },
  { id: '5004', code: '5004', name: 'Utilities Expense', type: 'Expense', isDefault: true },
  { id: '5005', code: '5005', name: 'Depreciation Expense', type: 'Expense', isDefault: true },
  { id: '5006', code: '5006', name: 'Marketing Expense', type: 'Expense', isDefault: true },
  { id: '5007', code: '5007', name: 'Office Supplies', type: 'Expense', isDefault: true },
];
