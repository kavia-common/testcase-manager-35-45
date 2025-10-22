import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function ConfigSettings() {
  const [config, setConfig] = useState(null);
  const [apiBase, setApiBase] = useState(process.env.REACT_APP_API_BASE || 'http://localhost:3001');
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await client.configs.get().catch(() => ({}));
        setConfig(data || {});
      } catch {
        setConfig({});
      }
    }
    load();
  }, []);

  async function save() {
    try {
      if (config) await client.configs.update(config);
      setStatus('Saved configuration. To change API base during runtime, reload app with REACT_APP_API_BASE set.');
      setTimeout(() => setStatus(''), 2500);
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    }
  }

  return (
    <div>
      <div className="header">
        <h1>Configuration</h1>
        <div className="sub">Manage backend URL and application settings</div>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div className="grid">
          <label>
            <div className="kicker">Backend URL</div>
            <input className="input" value={apiBase} onChange={(e) => setApiBase(e.target.value)} />
            <div className="helper">Currently using REACT_APP_API_BASE at build time. To take effect, reload app with updated env.</div>
          </label>
          <label>
            <div className="kicker">App Config JSON</div>
            <textarea
              className="textarea"
              value={JSON.stringify(config || {}, null, 2)}
              onChange={(e) => {
                try { setConfig(JSON.parse(e.target.value || '{}')); } catch { /* ignore */ }
              }}
            />
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn" onClick={save}>Save</button>
        </div>
        {status && <div className="helper" style={{ marginTop: 8 }}>{status}</div>}
      </div>
    </div>
  );
}
