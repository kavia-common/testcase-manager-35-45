import React, { useState } from 'react';
import client from '../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState({ testcases: 0, scenarios: 0, groups: 0, runs: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      // Attempt to compute stats; if endpoints not available yet, ignore gracefully
      const [t, s, g, r] = await Promise.allSettled([
        client.testcases.list(),
        client.scenarios.list(),
        client.groups.list(),
        client.runs.list({ limit: 1 }),
      ]);
      setStats({
        testcases: t.status === 'fulfilled' ? (t.value?.length || t.value?.total || 0) : 0,
        scenarios: s.status === 'fulfilled' ? (s.value?.length || s.value?.total || 0) : 0,
        groups: g.status === 'fulfilled' ? (g.value?.length || g.value?.total || 0) : 0,
        runs: r.status === 'fulfilled' ? (r.value?.length || r.value?.total || 0) : 0,
      });
    } catch (e) {
      setErr(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  // PUBLIC_INTERFACE
  function useState(initial) {
    return React.useState(initial);
  }

  React.useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="header">
        <h1>Dashboard</h1>
        <div className="sub">Overview of your Robot Framework assets</div>
      </div>
      {err && <div className="badge error" style={{ marginBottom: 12 }}>{String(err)}</div>}
      <div className="grid cols-2">
        {['Testcases', 'Scenarios', 'Groups', 'Runs'].map((label, i) => (
          <div className="card" key={label} style={{ padding: 18 }}>
            <div className="kicker">{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>
              {loading ? '—' : Object.values(stats)[i]}
            </div>
            <div className="helper" style={{ marginTop: 8 }}>
              {loading ? 'Loading...' : 'Up to date'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
