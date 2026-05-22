import { useState } from 'react';
import { ACCOUNT_TYPES } from '../data/defaultAccounts';

const TYPE_COLORS = {
  Asset: '#3b82f6',
  Liability: '#ef4444',
  Equity: '#8b5cf6',
  Revenue: '#10b981',
  Expense: '#f59e0b',
};

export default function ChartOfAccounts({ accounts, setAccounts }) {
  const [form, setForm] = useState({ code: '', name: '', type: 'Asset' });
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  function validate(f) {
    const e = {};
    if (!f.code.trim()) e.code = 'Code is required';
    else if (accounts.some(a => a.code === f.code.trim() && a.id !== editId))
      e.code = 'Code already exists';
    if (!f.name.trim()) e.name = 'Name is required';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    if (editId) {
      setAccounts(prev => prev.map(a => a.id === editId ? { ...a, ...form, code: form.code.trim(), name: form.name.trim() } : a));
      setEditId(null);
    } else {
      const id = Date.now().toString();
      setAccounts(prev => [...prev, { id, code: form.code.trim(), name: form.name.trim(), type: form.type, isDefault: false }]);
    }
    setForm({ code: '', name: '', type: 'Asset' });
  }

  function startEdit(acc) {
    setEditId(acc.id);
    setForm({ code: acc.code, name: acc.name, type: acc.type });
    setErrors({});
  }

  function cancelEdit() {
    setEditId(null);
    setForm({ code: '', name: '', type: 'Asset' });
    setErrors({});
  }

  function deleteAccount(id) {
    if (window.confirm('Delete this account? This cannot be undone.')) {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
  }

  const filtered = accounts.filter(a => {
    const matchType = filter === 'All' || a.type === filter;
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search);
    return matchType && matchSearch;
  });

  const grouped = ACCOUNT_TYPES.reduce((acc, type) => {
    acc[type] = filtered.filter(a => a.type === type);
    return acc;
  }, {});

  return (
    <div className="page">
      <h2 className="page-title">Chart of Accounts</h2>

      <form className="card form-card" onSubmit={handleSubmit}>
        <h3 className="form-title">{editId ? 'Edit Account' : 'Add New Account'}</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Account Code</label>
            <input
              className={errors.code ? 'input error' : 'input'}
              placeholder="e.g. 1008"
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
            />
            {errors.code && <span className="error-msg">{errors.code}</span>}
          </div>
          <div className="form-group">
            <label>Account Name</label>
            <input
              className={errors.name ? 'input error' : 'input'}
              placeholder="e.g. Petty Cash"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label>Type</label>
            <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit">{editId ? 'Update' : 'Add Account'}</button>
          {editId && <button className="btn btn-ghost" type="button" onClick={cancelEdit}>Cancel</button>}
        </div>
      </form>

      <div className="card">
        <div className="toolbar">
          <input className="input search-input" placeholder="Search accounts..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="filter-tabs">
            {['All', ...ACCOUNT_TYPES].map(t => (
              <button key={t} className={`filter-tab ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}
                style={filter === t && t !== 'All' ? { backgroundColor: TYPE_COLORS[t], color: '#fff', borderColor: TYPE_COLORS[t] } : {}}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {ACCOUNT_TYPES.map(type => {
          const list = grouped[type];
          if (!list.length) return null;
          return (
            <div key={type} className="account-group">
              <div className="group-header" style={{ borderLeftColor: TYPE_COLORS[type] }}>
                <span className="group-badge" style={{ backgroundColor: TYPE_COLORS[type] }}>{type}</span>
                <span className="group-count">{list.length} accounts</span>
              </div>
              <div className="account-table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Normal Balance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map(acc => (
                      <tr key={acc.id} className={editId === acc.id ? 'row-editing' : ''}>
                        <td><span className="code-badge">{acc.code}</span></td>
                        <td>{acc.name}</td>
                        <td>
                          <span className={`balance-badge ${type === 'Asset' || type === 'Expense' ? 'debit' : 'credit'}`}>
                            {type === 'Asset' || type === 'Expense' ? 'Debit' : 'Credit'}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button className="btn-icon" title="Edit" onClick={() => startEdit(acc)}>&#9998;</button>
                            {!acc.isDefault && (
                              <button className="btn-icon danger" title="Delete" onClick={() => deleteAccount(acc.id)}>&#128465;</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {!filtered.length && (
          <div className="empty-state">No accounts found.</div>
        )}
      </div>
    </div>
  );
}
