import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../../api/client';

export default function LogView() {
  const { id } = useParams();
  const [text, setText] = useState('');
  const [artifacts, setArtifacts] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    async function load() {
      setErr(null);
      try {
        const [logsRes, artsRes] = await Promise.allSettled([client.runs.logs(id), client.runs.artifacts(id)]);
        if (logsRes.status === 'fulfilled') {
          // If backend returns JSON, normalize; prefer text
          setText(typeof logsRes.value === 'string' ? logsRes.value : JSON.stringify(logsRes.value, null, 2));
        }
        if (artsRes.status === 'fulfilled') {
          setArtifacts(Array.isArray(artsRes.value) ? artsRes.value : (artsRes.value?.items || []));
        }
      } catch (e) {
        setErr(e.message || 'Failed to load logs');
      }
    }
    load();
  }, [id]);

  return (
    <div>
      <div className="header">
        <h1>Run Logs</h1>
        <div className="sub">Execution logs and artifacts for run #{id}</div>
      </div>
      {err && <div className="badge error" style={{ marginBottom: 10 }}>{String(err)}</div>}
      <div className="grid cols-2">
        <div className="card" style={{ padding: 12 }}>
          <div className="kicker" style={{ marginBottom: 8 }}>Logs</div>
          <pre style={{ maxHeight: 520, overflow: 'auto', whiteSpace: 'pre-wrap' }}>{text || 'No logs available yet.'}</pre>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="kicker" style={{ marginBottom: 8 }}>Artifacts</div>
          {artifacts.length === 0 ? (
            <div className="helper">No artifacts.</div>
          ) : (
            <div className="grid">
              {artifacts.map((a, i) => {
                const url = typeof a === 'string' ? a : (a.url || a.href);
                const name = typeof a === 'string' ? a.split('/').pop() : (a.name || a.filename || url);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>{name}</div>
                    {url && <a className="btn ghost" href={url} target="_blank" rel="noreferrer">Open</a>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
