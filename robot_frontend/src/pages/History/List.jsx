import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import Table from '../../components/Table';

export default function HistoryList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [filters, setFilters] = useState({ status: '', target: '', from: '', to: '' });

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await client.runs.list(filters);
      setRows(Array.isArray(data) ? data : (data?.items || []));
    } catch (e) {
      setErr(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // initial
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [filters]); // debounce

  return (
    <div>
      <div className="header">
        <h1>Run History</h1>
        <div className="sub">Past executions with status and timestamps</div>
      </div>
      <div className="toolbar">
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Status</option>
            <option>pending</option>
            <option>running</option>
            <option>passed</option>
            <option>failed</option>
          </select>
          <input className="input" placeholder="Target contains..." value={filters.target} onChange={(e) => setFilters({ ...filters, target: e.target.value })} />
          <input className="input" type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          <input className="input" type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        </div>
        <button className="btn ghost" onClick={() => setFilters({ status: '', target: '', from: '', to: '' })}>Reset</button>
      </div>
      {err && <div className="badge error" style={{ marginBottom: 10 }}>{String(err)}</div>}
      <Table
        columns={[
          { header: 'ID', key: 'id' },
          { header: 'Target', render: (r) => r.target_name || r.testcase_name || r.scenario_name || r.target || '—' },
          { header: 'Type', render: (r) => r.scenario_id ? 'Scenario' : 'Testcase' },
          { header: 'Status', render: (r) => <span className={`badge ${r.status === 'passed' ? 'success' : r.status === 'failed' ? 'error' : 'warn'}`}>{r.status || '—'}</span> },
          { header: 'Started', key: 'started_at' },
          { header: 'Finished', key: 'finished_at' },
          { header: 'Actions', render: (r) => (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost" onClick={() => navigate(`/logs/${r.id}`)}>Logs</button>
            </div>
          )},
        ]}
        rows={loading ? [] : rows}
        empty={loading ? 'Loading...' : 'No runs'}
      />
    </div>
  );
}
