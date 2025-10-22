import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';

export default function TestcaseEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await client.testcases.get(id);
      setRow(data);
    } catch (e) {
      alert(`Failed to load: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function save() {
    try {
      await client.testcases.update(id, row);
      navigate('/testcases');
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!row) return <div>Not found</div>;

  return (
    <div>
      <div className="header">
        <h1>Edit Testcase</h1>
        <div className="sub">#{id}</div>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div className="grid">
          <label>
            <div className="kicker">Name</div>
            <input className="input" value={row.name || ''} onChange={(e) => setRow({ ...row, name: e.target.value })} />
          </label>
          <label>
            <div className="kicker">Description</div>
            <input className="input" value={row.description || ''} onChange={(e) => setRow({ ...row, description: e.target.value })} />
          </label>
          <label>
            <div className="kicker">Tags</div>
            <input className="input" value={Array.isArray(row.tags) ? row.tags.join(', ') : (row.tags || '')} onChange={(e) => setRow({ ...row, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} />
          </label>
          <label>
            <div className="kicker">Content</div>
            <textarea className="textarea" value={row.content || ''} onChange={(e) => setRow({ ...row, content: e.target.value })} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="btn ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
