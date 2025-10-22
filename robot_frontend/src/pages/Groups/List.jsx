import { useEffect, useState } from 'react';
import client from '../../api/client';
import Table from '../../components/Table';
import Modal from '../../components/Modal';

function GroupForm({ initial, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ name, description }); }}>
      <div className="grid">
        <label>
          <div className="kicker">Name</div>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          <div className="kicker">Description</div>
          <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
        <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn">Save</button>
      </div>
    </form>
  );
}

export default function GroupList() {
  const [rows, setRows] = useState([]);
  const [testcases, setTestcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [err, setErr] = useState(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const [g, t] = await Promise.all([client.groups.list(), client.testcases.list()]);
      setRows(Array.isArray(g) ? g : (g?.items || []));
      setTestcases(Array.isArray(t) ? t : (t?.items || []));
    } catch (e) {
      setErr(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function remove(row) {
    if (!window.confirm(`Delete group "${row.name}"?`)) return;
    try { await client.groups.remove(row.id); await load(); } catch (e) { alert(e.message); }
  }
  async function assign(group, testcaseId) {
    try { await client.groups.assign(group.id, testcaseId); await load(); } catch (e) { alert(e.message); }
  }
  async function unassign(group, testcaseId) {
    try { await client.groups.unassign(group.id, testcaseId); await load(); } catch (e) { alert(e.message); }
  }

  return (
    <div>
      <div className="header">
        <h1>Groups</h1>
        <div className="sub">Organize testcases into logical groups</div>
      </div>
      <div className="toolbar">
        <div />
        <button className="btn" onClick={() => setModal({ mode: 'create' })}>New Group</button>
      </div>
      {err && <div className="badge error" style={{ marginBottom: 10 }}>{String(err)}</div>}
      <Table
        columns={[
          { header: 'Name', key: 'name' },
          { header: 'Description', key: 'description' },
          { header: 'Members', render: (r) => (r.testcases ? r.testcases.length : (r.members?.length || 0)) },
          {
            header: 'Actions',
            render: (r) => (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn secondary" onClick={() => setModal({ mode: 'edit', row: r })}>Edit</button>
                <button className="btn danger" onClick={() => remove(r)}>Delete</button>
              </div>
            )
          },
        ]}
        rows={loading ? [] : rows}
        empty={loading ? 'Loading...' : 'No groups'}
      />

      {modal && (
        <Modal
          title={modal.mode === 'create' ? 'New Group' : 'Edit Group'}
          onClose={() => setModal(null)}
          width="720px"
        >
          <GroupForm
            initial={modal.row}
            onCancel={() => setModal(null)}
            onSubmit={async (payload) => {
              try {
                if (modal.mode === 'create') await client.groups.create(payload);
                else await client.groups.update(modal.row.id, payload);
                setModal(null); await load();
              } catch (e) { alert(e.message); }
            }}
          />
          {modal.mode === 'edit' && (
            <div style={{ marginTop: 16 }}>
              <div className="kicker" style={{ marginBottom: 8 }}>Assign Testcases</div>
              <div className="grid">
                <select className="select" onChange={(e) => e.target.value && assign(modal.row, e.target.value)}>
                  <option value="">Select testcase...</option>
                  {testcases.map(tc => <option key={tc.id} value={tc.id}>{tc.name}</option>)}
                </select>
                <div className="card" style={{ padding: 10 }}>
                  {(modal.row.testcases || modal.row.members || []).map((tc) => (
                    <div key={tc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                      <div>{tc.name || tc}</div>
                      <button className="btn ghost" onClick={() => unassign(modal.row, tc.id || tc)}>Remove</button>
                    </div>
                  ))}
                  {((modal.row.testcases || modal.row.members || []).length === 0) && <div className="helper">No testcases assigned</div>}
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
