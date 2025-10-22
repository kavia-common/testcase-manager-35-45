import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TestcaseList from './pages/Testcases/List';
import TestcaseEdit from './pages/Testcases/Edit';
import GroupList from './pages/Groups/List';
import ScenarioList from './pages/Scenarios/List';
import ScenarioEdit from './pages/Scenarios/Edit';
import ExecutionRun from './pages/Execution/Run';
import HistoryList from './pages/History/List';
import LogView from './pages/Logs/View';
import ConfigSettings from './pages/Config/Settings';

function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/testcases" element={<TestcaseList />} />
          <Route path="/testcases/:id" element={<TestcaseEdit />} />
          <Route path="/groups" element={<GroupList />} />
          <Route path="/scenarios" element={<ScenarioList />} />
          <Route path="/scenarios/:id" element={<ScenarioEdit />} />
          <Route path="/run" element={<ExecutionRun />} />
          <Route path="/history" element={<HistoryList />} />
          <Route path="/logs/:id" element={<LogView />} />
          <Route path="/config" element={<ConfigSettings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
