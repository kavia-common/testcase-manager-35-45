import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import Table from '../../components/Table';
import Modal from '../../components/Modal';

function TestcaseForm({ initial, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [tags, setTags] = useState(Array.isArray(initial?.tags) ? initial.tags.join(', ') : (initial?.tags || ''));
  const [content, setContent] = useState(initial?.content || '');

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ name, description, tags: tags.split(',').map(t => t.trim()).filter(Boolean), content }); }}>
      <div className="grid">
        <label>
          <div className="kicker">Name</div>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          <div className="kicker">Description</div>
          <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          <div className="kicker">Tags</div>
          <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="smoke, regression" />
        </label>
        <label>
          <div className="kicker">Content (Robot syntax)</div>
          <textarea className="textarea" value={content} onChange={(e) => setContent(e.target.value)} placeholder="*** Test Cases ***" />
        </label>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
        <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn">Save</button>
      </div>
    </form>
  );
}

export default function TestcaseList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [modal, setModal] = useState(null); // {mode: 'create'|'edit'|'view', row}

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await client.testcases.list();
      setRows(Array.isArray(data) ? data : (data?.items || []));
    } catch (e) {
      setErr(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return rows.filter(r =>
      !term ||
      r.name?.toLowerCase().includes(term) ||
      r.description?.toLowerCase().includes(term) ||
      (Array.isArray(r.tags) ? r.tags.join(',').toLowerCase().includes(term) : (r.tags || '').toLowerCase().includes(term))
    );
  }, [rows, q]);

  async function onDelete(row) {
    if (!window.confirm(`Delete testcase "${row.name}"? This cannot be undone.`)) return;
    try {
      await client.testcases.remove(row.id);
      await load();
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    }
  }

  return (
    <div>
      <div className="header">
        <h1>Testcases</h1>
        <div className="sub">Create, edit, and manage Robot Framework testcases</div>
      </div>
      <div className="toolbar">
        <input className="input" placeholder="Search testcases..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => setModal({ mode: 'create' })}>New Testcase</button>
        </div>
      </div>
      {err && <div className="badge error" style={{ marginBottom: 10 }}>{String(err)}</div>}
      <Table
        columns={[
          { header: 'Name', key: 'name' },
          { header: 'Description', key: 'description' },
          { header: 'Tags', render: (r) => (Array.isArray(r.tags) ? r.tags.join(', ') : r.tags) || '—' },
          { header: 'Actions', render: (r) => (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost" onClick={() => setModal({ mode: 'view', row: r })}>View</button>
              <button className="btn secondary" onClick={() => setModal({ mode: 'edit', row: r })}>Edit</button>
              <button className="btn danger" onClick={() => onDelete(r)}>Delete</button>
              <button className="btn" onClick={() => navigate(`/run?testcase=${encodeURIComponent(r.id)}`)}>Run</button>
            </div>
          )},
        ]}
        rows={loading ? [] : filtered}
        empty={loading ? 'Loading...' : 'No testcases found'}
      />

      {modal && (
        <Modal
          title={modal.mode === 'create' ? 'New Testcase' : modal.mode === 'edit' ? 'Edit Testcase' : 'Testcase Details'}
          onClose={() => setModal(null)}
          width="700px"
        >
          {modal.mode === 'view' ? (
            <div className="grid">
              <div><div className="kicker">Name</div><div>{modal.row.name}</div></div>
              <div><div className="kicker">Description</div><div>{modal.row.description || '—'}</div></div>
              <div><div className="kicker">Tags</div><div>{Array.isArray(modal.row.tags) ? modal.row.tags.join(', ') : (modal.row.tags || '—')}</div></div>
              <div>
                <div className="kicker">Content</div>
                <pre style={{ whiteSpace: 'pre-wrap', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 10, overflow: 'auto' }}>
                  {modal.row.content || '—'}
                </pre>
              </div>
            </div>
          ) : (
            <TestcaseForm
              initial={modal.row}
              onCancel={() => setModal(null)}
              onSubmit={async (payload) => {
                try {
                  if (modal.mode === 'create') await client.testcases.create(payload);
                  else await client.testcases.update(modal.row.id, payload);
                  setModal(null);
                  await load();
                } catch (e) {
                  alert(`Save failed: ${e.message}`);
                }
              }}
            />
          )}
        </Modal>
      )}
    </div>
  );
}
