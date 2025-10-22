import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';

export default function ScenarioEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [row, setRow] = useState(null);
  const [testcases, setTestcases] = useState([]);

  async function load() {
    try {
      const [s, t] = await Promise.all([client.scenarios.get(id), client.testcases.list()]);
      setRow(s);
      setTestcases(Array.isArray(t) ? t : (t?.items || []));
    } catch (e) {
      alert(`Failed to load: ${e.message}`);
    }
  }
  useEffect(() => { load(); }, [id]);

  async function save() {
    try {
      await client.scenarios.update(id, row);
      navigate('/scenarios');
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    }
  }

  if (!row) return <div>Loading...</div>;

  return (
    <div>
      <div className="header">
        <h1>Edit Scenario</h1>
        <div className="sub">#{id}</div>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div className="grid">
          <label>
            <div className="kicker">Name</div>
            <input className="input" value={row.name || ''} onChange={(e) => setRow({ ...row, name: e.target.value })} />
          </label>
          <label>
            <div className="kicker">Testcase</div>
            <select
              className="select"
              value={row.testcase_id || row.testcaseId || ''}
              onChange={(e) => setRow({ ...row, testcase_id: e.target.value })}
            >
              <option value="">Select...</option>
              {testcases.map(tc => <option key={tc.id} value={tc.id}>{tc.name}</option>)}
            </select>
          </label>
          <label>
            <div className="kicker">Variables (JSON)</div>
            <textarea
              className="textarea"
              value={JSON.stringify(row.variables || {}, null, 2)}
              onChange={(e) => {
                try { setRow({ ...row, variables: JSON.parse(e.target.value || '{}') }); }
                catch { /* ignore */ }
              }}
            />
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
