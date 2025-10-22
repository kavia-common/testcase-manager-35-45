const DEFAULT_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

// PUBLIC_INTERFACE
export function createApiClient(baseUrl = DEFAULT_BASE) {
  /**
   * Simple API client around fetch with JSON handling, error normalization,
   * and base URL management.
   */
  const base = baseUrl.replace(/\/+$/, '');

  const buildUrl = (path) => `${base}${path.startsWith('/') ? '' : '/'}${path}`;

  async function request(path, { method = 'GET', headers = {}, body, query } = {}) {
    const url = new URL(buildUrl(path));
    if (query && typeof query === 'object') {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
      });
    }

    const init = {
      method,
      headers: {
        Accept: 'application/json',
        ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body
        ? body instanceof FormData
          ? body
          : typeof body === 'string'
            ? body
            : JSON.stringify(body)
        : undefined,
    };

    let res;
    try {
      res = await fetch(url.toString(), init);
    } catch (networkErr) {
      const e = new Error('Network error');
      e.cause = networkErr;
      e.isNetworkError = true;
      throw e;
    }

    let data = null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch {
        data = null;
      }
    } else {
      data = await res.text().catch(() => null);
    }

    if (!res.ok) {
      const err = new Error(data?.detail || data?.message || `Request failed: ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  // PUBLIC_INTERFACE
  function setBaseUrl(newBaseUrl) {
    return createApiClient(newBaseUrl);
  }

  // Domain helpers (paths are aligned to the backend high-level description)
  const testcases = {
    list: (params) => request('/testcases', { query: params }),
    get: (id) => request(`/testcases/${id}`),
    create: (payload) => request('/testcases', { method: 'POST', body: payload }),
    update: (id, payload) => request(`/testcases/${id}`, { method: 'PUT', body: payload }),
    remove: (id) => request(`/testcases/${id}`, { method: 'DELETE' }),
  };

  const groups = {
    list: () => request('/groups'),
    get: (id) => request(`/groups/${id}`),
    create: (payload) => request('/groups', { method: 'POST', body: payload }),
    update: (id, payload) => request(`/groups/${id}`, { method: 'PUT', body: payload }),
    remove: (id) => request(`/groups/${id}`, { method: 'DELETE' }),
    assign: (groupId, testcaseId) =>
      request(`/groups/${groupId}/testcases/${testcaseId}`, { method: 'POST' }),
    unassign: (groupId, testcaseId) =>
      request(`/groups/${groupId}/testcases/${testcaseId}`, { method: 'DELETE' }),
  };

  const scenarios = {
    list: () => request('/scenarios'),
    get: (id) => request(`/scenarios/${id}`),
    create: (payload) => request('/scenarios', { method: 'POST', body: payload }),
    update: (id, payload) => request(`/scenarios/${id}`, { method: 'PUT', body: payload }),
    remove: (id) => request(`/scenarios/${id}`, { method: 'DELETE' }),
    run: (id, variables) => request(`/scenarios/${id}/run`, { method: 'POST', body: { variables } }),
  };

  const runs = {
    triggerTestcase: (id, variables) =>
      request(`/runs`, { method: 'POST', body: { target_type: 'testcase', target_id: id, variables } }),
    triggerScenario: (id, variables) =>
      request(`/runs`, { method: 'POST', body: { target_type: 'scenario', target_id: id, variables } }),
    list: (params) => request('/runs', { query: params }),
    get: (id) => request(`/runs/${id}`),
    logs: (id) => request(`/logs/${id}/steps`),
    artifacts: (id) => request(`/logs/${id}/attachments`),
  };

  const configs = {
    get: () => request('/configs'),
    update: (payload) => request('/configs', { method: 'PUT', body: payload }),
  };

  return { request, setBaseUrl, testcases, groups, scenarios, runs, configs, baseUrl: base };
}

// Default client instance
const client = createApiClient();
export default client;
