import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import client from '../../api/client';

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function ExecutionRun() {
  const q = useQuery();
  const navigate = useNavigate();
  const [testcases, setTestcases] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [targetType, setTargetType] = useState(q.get('scenario') ? 'scenario' : 'testcase');
  const [targetId, setTargetId] = useState(q.get('scenario') || q.get('testcase') || '');
  const [variables, setVariables] = useState('{}');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.allSettled([client.testcases.list(), client.scenarios.list()]).then(([t, s]) => {
      if (t.status === 'fulfilled') setTestcases(Array.isArray(t.value) ? t.value : (t.value?.items || []));
      if (s.status === 'fulfilled') setScenarios(Array.isArray(s.value) ? s.value : (s.value?.items || []));
    });
  }, []);

  async function run() {
    let vars;
    try { vars = JSON.parse(variables || '{}'); } catch { return alert('Variables must be valid JSON'); }

    setStatus('running');
    setMessage('');
    try {
      let result;
      if (targetType === 'testcase') result = await client.runs.triggerTestcase(targetId, vars);
      else result = await client.runs.triggerScenario(targetId, vars);
      setMessage('Run triggered successfully');
      navigate(`/history`);
    } catch (e) {
      setStatus('error');
      setMessage(e.message || 'Run failed');
    } finally {
      if (status !== 'error') setStatus('idle');
    }
  }

  return (
    <div>
      <div className="header">
        <h1>Execution</h1>
        <div className="sub">Trigger a run for a testcase or scenario</div>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div className="grid cols-2">
          <label>
            <div className="kicker">Target Type</div>
            <select className="select" value={targetType} onChange={(e) => { setTargetType(e.target.value); setTargetId(''); }}>
              <option value="testcase">Testcase</option>
              <option value="scenario">Scenario</option>
            </select>
          </label>
          <label>
            <div className="kicker">Target</div>
            <select className="select" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
              <option value="">Select...</option>
              {(targetType === 'testcase' ? testcases : scenarios).map((x) => (
                <option key={x.id} value={x.id}>{x.name}</option>
              ))}
            </select>
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            <div className="kicker">Variables (JSON)</div>
            <textarea className="textarea" value={variables} onChange={(e) => setVariables(e.target.value)} />
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn" onClick={run} disabled={!targetId || status === 'running'}>
            {status === 'running' ? 'Running...' : 'Run'}
          </button>
        </div>
        {message && <div className="helper" style={{ marginTop: 10 }}>{message}</div>}
      </div>
    </div>
  );
}
