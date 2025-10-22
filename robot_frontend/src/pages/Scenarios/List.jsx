import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import Table from '../../components/Table';
import Modal from '../../components/Modal';

function ScenarioForm({ initial, testcases, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [testcaseId, setTestcaseId] = useState(initial?.testcase_id || initial?.testcaseId || '');
  const [variables, setVariables] = useState(JSON.stringify(initial?.variables || {}, null, 2));

  function parseVars() {
    try { return JSON.parse(variables || '{}'); } catch { return null; }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); const vars = parseVars(); if (!vars) return alert('Variables must be valid JSON'); onSubmit({ name, testcase_id: testcaseId, variables: vars }); }}>
      <div className="grid">
        <label>
          <div className="kicker">Name</div>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          <div className="kicker">Testcase</div>
          <select className="select" value={testcaseId} onChange={(e) => setTestcaseId(e.target.value)} required>
            <option value="">Select...</option>
            {testcases.map(tc => <option key={tc.id} value={tc.id}>{tc.name}</option>)}
          </select>
        </label>
        <label>
          <div className="kicker">Variables (JSON)</div>
          <textarea className="textarea" value={variables} onChange={(e) => setVariables(e.target.value)} />
        </label>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
        <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn">Save</button>
      </div>
    </form>
  );
}

export default function ScenarioList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [testcases, setTestcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [modal, setModal] = useState(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const [s, t] = await Promise.all([client.scenarios.list(), client.testcases.list()]);
      setRows(Array.isArray(s) ? s : (s?.items || []));
      setTestcases(Array.isArray(t) ? t : (t?.items || []));
    } catch (e) {
      setErr(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function remove(row) {
    if (!window.confirm(`Delete scenario "${row.name}"?`)) return;
    try { await client.scenarios.remove(row.id); await load(); } catch (e) { alert(e.message); }
  }

  async function run(row) {
    try {
      await client.scenarios.run(row.id, row.variables || {});
      navigate('/history');
    } catch (e) {
      alert(`Run failed: ${e.message}`);
    }
  }

  return (
    <div>
      <div className="header">
        <h1>Scenarios</h1>
        <div className="sub">Reusable parameterized executions for testcases</div>
      </div>
      <div className="toolbar">
        <div />
        <button className="btn" onClick={() => setModal({ mode: 'create' })}>New Scenario</button>
      </div>
      {err && <div className="badge error" style={{ marginBottom: 10 }}>{String(err)}</div>}
      <Table
        columns={[
          { header: 'Name', key: 'name' },
          { header: 'Testcase', render: (r) => testcases.find(t => t.id === (r.testcase_id || r.testcaseId))?.name || (r.testcase_id || r.testcaseId || '—') },
          { header: 'Variables', render: (r) => <code>{JSON.stringify(r.variables || {})}</code> },
          { header: 'Actions', render: (r) => (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={() => run(r)}>Run</button>
              <button className="btn secondary" onClick={() => setModal({ mode: 'edit', row: r })}>Edit</button>
              <button className="btn danger" onClick={() => remove(r)}>Delete</button>
            </div>
          )},
        ]}
        rows={loading ? [] : rows}
        empty={loading ? 'Loading...' : 'No scenarios'}
      />

      {modal && (
        <Modal
          title={modal.mode === 'create' ? 'New Scenario' : 'Edit Scenario'}
          onClose={() => setModal(null)}
          width="720px"
        >
          <ScenarioForm
            initial={modal.row}
            testcases={testcases}
            onCancel={() => setModal(null)}
            onSubmit={async (payload) => {
              try {
                if (modal.mode === 'create') await client.scenarios.create(payload);
                else await client.scenarios.update(modal.row.id, payload);
                setModal(null); await load();
              } catch (e) { alert(e.message); }
            }}
          />
        </Modal>
      )}
    </div>
  );
}
