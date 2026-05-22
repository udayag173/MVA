import { useMemo, useState } from 'react';

const TYPE_ORDER = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

function computeBalances(accounts, journals) {
  const balances = {};
  accounts.forEach(a => { balances[a.id] = { debit: 0, credit: 0 }; });

  journals.forEach(j => {
    j.lines.forEach(l => {
      if (!balances[l.accountId]) balances[l.accountId] = { debit: 0, credit: 0 };
      balances[l.accountId].debit += l.debit;
      balances[l.accountId].credit += l.credit;
    });
  });

  return accounts.map(acc => {
    const { debit, credit } = balances[acc.id] || { debit: 0, credit: 0 };
    const net = debit - credit;
    const normalDebit = acc.type === 'Asset' || acc.type === 'Expense';
    return {
      ...acc,
      totalDebit: debit,
      totalCredit: credit,
      netDebit: normalDebit && net > 0 ? net : ((!normalDebit && net < 0) ? -net : 0),
      netCredit: !normalDebit && net < 0 ? -net : ((normalDebit && net < 0) ? -net : 0),
      rawNet: net,
    };
  });
}

export default function TrialBalance({ accounts, journals }) {
  const [showZero, setShowZero] = useState(false);
  const [filterType, setFilterType] = useState('All');

  const rows = useMemo(() => computeBalances(accounts, journals), [accounts, journals]);

  const filtered = rows.filter(r => {
    if (!showZero && r.totalDebit === 0 && r.totalCredit === 0) return false;
    if (filterType !== 'All' && r.type !== filterType) return false;
    return true;
  });

  const grandDebit = filtered.reduce((s, r) => s + r.totalDebit, 0);
  const grandCredit = filtered.reduce((s, r) => s + r.totalCredit, 0);
  const netDebitTotal = filtered.reduce((s, r) => s + (r.rawNet > 0 ? r.rawNet : 0), 0);
  const netCreditTotal = filtered.reduce((s, r) => s + (r.rawNet < 0 ? -r.rawNet : 0), 0);
  const isBalanced = Math.abs(grandDebit - grandCredit) < 0.001;

  function fmt(n) {
    if (n === 0) return '—';
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  }

  const grouped = TYPE_ORDER.reduce((acc, type) => {
    acc[type] = filtered.filter(r => r.type === type);
    return acc;
  }, {});

  function printReport() {
    window.print();
  }

  return (
    <div className="page">
      <h2 className="page-title">Trial Balance</h2>

      <div className="card summary-bar">
        <div className="summary-item">
          <span className="summary-label">Total Debits</span>
          <span className="summary-value amount-debit">{grandDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-label">Total Credits</span>
          <span className="summary-value amount-credit">{grandCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-label">Status</span>
          <span className={`balance-status ${isBalanced ? 'balanced' : 'unbalanced'}`}>
            {isBalanced ? 'Balanced' : 'UNBALANCED'}
          </span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-label">Journal Entries</span>
          <span className="summary-value">{journals.length}</span>
        </div>
      </div>

      {!isBalanced && grandDebit + grandCredit > 0 && (
        <div className="alert alert-error">
          Warning: Books are out of balance by {Math.abs(grandDebit - grandCredit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}.
          All journal entries should have equal debits and credits.
        </div>
      )}

      <div className="card">
        <div className="toolbar print-hide">
          <div className="filter-tabs">
            {['All', ...TYPE_ORDER].map(t => (
              <button key={t} className={`filter-tab ${filterType === t ? 'active' : ''}`} onClick={() => setFilterType(t)}>{t}</button>
            ))}
          </div>
          <div className="toolbar-right">
            <label className="toggle-label">
              <input type="checkbox" checked={showZero} onChange={e => setShowZero(e.target.checked)} />
              Show zero-balance
            </label>
            <button className="btn btn-ghost btn-sm" onClick={printReport}>Print / Export</button>
          </div>
        </div>

        <div className="print-header" style={{ display: 'none' }}>
          <h2>Trial Balance</h2>
          <p>As of {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">No transactions to display. Post some journal entries first.</div>
        ) : (
          <>
            {TYPE_ORDER.map(type => {
              const list = grouped[type];
              if (!list.length) return null;
              const typeDebit = list.reduce((s, r) => s + r.totalDebit, 0);
              const typeCredit = list.reduce((s, r) => s + r.totalCredit, 0);
              return (
                <div key={type} className="tb-group">
                  <div className="tb-group-header">
                    <span>{type}s</span>
                    <span className="tb-group-totals">
                      Dr: {typeDebit > 0 ? typeDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'} |
                      Cr: {typeCredit > 0 ? typeCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                    </span>
                  </div>
                  <div className="account-table-wrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Account Name</th>
                          <th className="num-col">Debit</th>
                          <th className="num-col">Credit</th>
                          <th className="num-col">Net Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map(row => (
                          <tr key={row.id} className={row.totalDebit === 0 && row.totalCredit === 0 ? 'zero-row' : ''}>
                            <td><span className="code-badge">{row.code}</span></td>
                            <td>{row.name}</td>
                            <td className="num-col amount-debit">{fmt(row.totalDebit)}</td>
                            <td className="num-col amount-credit">{fmt(row.totalCredit)}</td>
                            <td className="num-col">
                              {row.rawNet > 0 ? <span className="amount-debit">{row.rawNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Dr</span>
                                : row.rawNet < 0 ? <span className="amount-credit">{(-row.rawNet).toLocaleString('en-IN', { minimumFractionDigits: 2 })} Cr</span>
                                  : <span className="zero-bal">0.00</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            <div className="tb-totals-row">
              <span className="tb-totals-label">Grand Total</span>
              <div className="tb-totals-values">
                <span className="amount-debit">{grandDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className="tb-totals-sep">/</span>
                <span className="amount-credit">{grandCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
