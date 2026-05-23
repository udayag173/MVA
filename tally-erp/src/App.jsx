import { useState } from 'react';
import { useLocalStorage } from './hooks/useStorage';
import { defaultAccounts } from './data/defaultAccounts';
import ChartOfAccounts from './components/ChartOfAccounts';
import JournalEntry from './components/JournalEntry';
import TrialBalance from './components/TrialBalance';
import './App.css';

const NAV_ITEMS = [
  { id: 'coa', label: 'Chart of Accounts', icon: '🏦' },
  { id: 'je', label: 'Journal Entry', icon: '📒' },
  { id: 'tb', label: 'Trial Balance', icon: '⚖️' },
];

export default function App() {
  const [tab, setTab] = useState('coa');
  const [accounts, setAccounts] = useLocalStorage('tally_accounts', defaultAccounts);
  const [journals, setJournals] = useLocalStorage('tally_journals', []);
  const [menuOpen, setMenuOpen] = useState(false);

  function resetData() {
    if (window.confirm('Reset all data to defaults? All journal entries and custom accounts will be lost.')) {
      setAccounts(defaultAccounts);
      setJournals([]);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            {menuOpen ? '✕' : '☰'}
          </button>
          <div className="logo">
            <span className="logo-icon">T</span>
            <span className="logo-text">TallyERP</span>
          </div>
        </div>
        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item ${tab === item.id ? 'active' : ''}`}
              onClick={() => { setTab(item.id); setMenuOpen(false); }}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="header-right">
          <span className="entry-count">{journals.length} entries</span>
          <button className="btn btn-ghost btn-sm" onClick={resetData} title="Reset data">Reset</button>
        </div>
      </header>

      <main className="main">
        {tab === 'coa' && <ChartOfAccounts accounts={accounts} setAccounts={setAccounts} />}
        {tab === 'je' && <JournalEntry accounts={accounts} journals={journals} setJournals={setJournals} />}
        {tab === 'tb' && <TrialBalance accounts={accounts} journals={journals} />}
      </main>

      <footer className="footer">
        <span>TallyERP &copy; {new Date().getFullYear()} &mdash; Data stored locally in your browser</span>
      </footer>
    </div>
  );
}
