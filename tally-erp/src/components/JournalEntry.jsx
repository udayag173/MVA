import { useState } from 'react';

const EMPTY_LINE = { accountId: '', debit: '', credit: '' };

function newEntry() {
  return {
    id: Date.now().toString(),
    date: new Date().toISOString().slice(0, 10),
    reference: '',
    description: '',
    lines: [{ ...EMPTY_LINE }, { ...EMPTY_LINE }],
  };
}

export default function JournalEntry({ accounts, journals, setJournals }) {
  const [form, setForm] = useState(newEntry());
  const [errors, setErrors] = useState({});
  const [viewEntry, setViewEntry] = useState(null);
  const [search, setSearch] = useState('');

  function setLine(idx, field, val) {
    setForm(f => {
      const lines = f.lines.map((l, i) => i === idx ? { ...l, [field]: val } : l);
      return { ...f, lines };
    });
  }

  function addLine() {
    setForm(f => ({ ...f, lines: [...f.lines, { ...EMPTY_LINE }] }));
  }

  function removeLine(idx) {
    setForm(f => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }));
  }

  function parseAmt(v) {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : Math.abs(n);
  }

  const totalDebit = form.lines.reduce((s, l) => s + parseAmt(l.debit), 0);
  const totalCredit = form.lines.reduce((s, l) => s + parseAmt(l.credit), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.001 && totalDebit > 0;

  function validate() {
    const e = {};
    if (!form.date) e.date = 'Date is required';
    if (!form.description.trim()) e.description = 'Description is required';

    const filledLines = form.lines.filter(l => l.accountId || l.debit || l.credit);
    if (filledLines.length < 2) e.lines = 'At least two lines are required';

    filledLines.forEach((l, i) => {
      if (!l.accountId) e[`line_${i}_account`] = 'Select account';
      const d = parseAmt(l.debit), c = parseAmt(l.credit);
      if (d === 0 && c === 0) e[`line_${i}_amount`] = 'Enter debit or credit';
      if (d > 0 && c > 0) e[`line_${i}_amount`] = 'Only debit OR credit per line';
    });

    if (!balanced && !e.lines) e.balance = `Debits (${fmt(totalDebit)}) must equal Credits (${fmt(totalCredit)})`;
    return e;
  }

  function fmt(n) {
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const entry = {
      ...form,
      id: Date.now().toString(),
      lines: form.lines.filter(l => l.accountId && (parseAmt(l.debit) > 0 || parseAmt(l.credit) > 0))
        .map(l => ({ accountId: l.accountId, debit: parseAmt(l.debit), credit: parseAmt(l.credit) })),
    };
    setJournals(prev => [entry, ...prev]);
    setForm(newEntry());
  }

  function deleteEntry(id) {
    if (window.confirm('Delete this journal entry?')) {
      setJournals(prev => prev.filter(j => j.id !== id));
      if (viewEntry?.id === id) setViewEntry(null);
    }
  }

  const accountMap = Object.fromEntries(accounts.map(a => [a.id, a]));

  const filteredJournals = journals.filter(j => {
    if (!search) return true;
    const s = search.toLowerCase();
    return j.description.toLowerCase().includes(s) ||
      j.reference.toLowerCase().includes(s) ||
      j.date.includes(s);
  });

  return (
    <div className="page">
      <h2 className="page-title">Journal Entry</h2>

      <form className="card form-card" onSubmit={handleSubmit}>
        <h3 className="form-title">New Journal Entry</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" className={errors.date ? 'input error' : 'input'} value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            {errors.date && <span className="error-msg">{errors.date}</span>}
          </div>
          <div className="form-group">
            <label>Reference No.</label>
            <input className="input" placeholder="e.g. JV-001" value={form.reference}
              onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
          </div>
          <div className="form-group flex-2">
            <label>Description / Narration</label>
            <input className={errors.description ? 'input error' : 'input'} placeholder="Describe the transaction"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            {errors.description && <span className="error-msg">{errors.description}</span>}
          </div>
        </div>

        <div className="je-table-wrap">
          <table className="table je-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Account</th>
                <th>Debit (Dr)</th>
                <th>Credit (Cr)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {form.lines.map((line, idx) => (
                <tr key={idx}>
                  <td>
                    <select
                      className={errors[`line_${idx}_account`] ? 'input error' : 'input'}
                      value={line.accountId}
                      onChange={e => setLine(idx, 'accountId', e.target.value)}>
                      <option value="">-- Select Account --</option>
                      {['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map(type => {
                        const grp = accounts.filter(a => a.type === type);
                        if (!grp.length) return null;
                        return (
                          <optgroup key={type} label={type}>
                            {grp.map(a => <option key={a.id} value={a.id}>{a.code} – {a.name}</option>)}
                          </optgroup>
                        );
                      })}
                    </select>
                    {errors[`line_${idx}_account`] && <span className="error-msg">{errors[`line_${idx}_account`]}</span>}
                  </td>
                  <td>
                    <input type="number" min="0" step="0.01" className={errors[`line_${idx}_amount`] ? 'input error' : 'input'}
                      placeholder="0.00" value={line.debit}
                      onChange={e => setLine(idx, 'debit', e.target.value)} />
                  </td>
                  <td>
                    <input type="number" min="0" step="0.01" className={errors[`line_${idx}_amount`] ? 'input error' : 'input'}
                      placeholder="0.00" value={line.credit}
                      onChange={e => setLine(idx, 'credit', e.target.value)} />
                    {errors[`line_${idx}_amount`] && <span className="error-msg">{errors[`line_${idx}_amount`]}</span>}
                  </td>
                  <td>
                    {form.lines.length > 2 && (
                      <button type="button" className="btn-icon danger" onClick={() => removeLine(idx)}>&#215;</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="totals-row">
                <td><button type="button" className="btn btn-ghost btn-sm" onClick={addLine}>+ Add Line</button></td>
                <td><strong className={totalDebit > 0 ? 'amount-debit' : ''}>{totalDebit > 0 ? fmt(totalDebit) : '—'}</strong></td>
                <td><strong className={totalCredit > 0 ? 'amount-credit' : ''}>{totalCredit > 0 ? fmt(totalCredit) : '—'}</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {errors.lines && <div className="alert alert-error">{errors.lines}</div>}
        {errors.balance && <div className="alert alert-error">{errors.balance}</div>}
        {balanced && totalDebit > 0 && <div className="alert alert-success">Balanced — Total: {fmt(totalDebit)}</div>}

        <div className="form-actions">
          <button className="btn btn-primary" type="submit">Post Journal Entry</button>
          <button className="btn btn-ghost" type="button" onClick={() => { setForm(newEntry()); setErrors({}); }}>Clear</button>
        </div>
      </form>

      <div className="card">
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>Posted Entries ({journals.length})</h3>
          <input className="input search-input" placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {filteredJournals.length === 0 ? (
          <div className="empty-state">No journal entries yet.</div>
        ) : (
          <div className="journal-list">
            {filteredJournals.map(j => (
              <div key={j.id} className="journal-card">
                <div className="journal-header" onClick={() => setViewEntry(viewEntry?.id === j.id ? null : j)}>
                  <div className="journal-meta">
                    <span className="journal-date">{j.date}</span>
                    {j.reference && <span className="code-badge">{j.reference}</span>}
                    <span className="journal-desc">{j.description}</span>
                  </div>
                  <div className="journal-amount">
                    {fmt(j.lines.reduce((s, l) => s + l.debit, 0))}
                    <span className="chevron">{viewEntry?.id === j.id ? '▲' : '▼'}</span>
                  </div>
                </div>
                {viewEntry?.id === j.id && (
                  <div className="journal-detail">
                    <table className="table">
                      <thead>
                        <tr><th>Account</th><th>Debit</th><th>Credit</th></tr>
                      </thead>
                      <tbody>
                        {j.lines.map((l, i) => {
                          const acc = accountMap[l.accountId];
                          return (
                            <tr key={i}>
                              <td>{acc ? `${acc.code} – ${acc.name}` : l.accountId}</td>
                              <td className="amount-debit">{l.debit > 0 ? fmt(l.debit) : ''}</td>
                              <td className="amount-credit">{l.credit > 0 ? fmt(l.credit) : ''}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div className="journal-actions">
                      <button className="btn btn-danger btn-sm" onClick={() => deleteEntry(j.id)}>Delete Entry</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
