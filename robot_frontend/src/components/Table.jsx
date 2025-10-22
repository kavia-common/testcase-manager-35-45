export default function Table({ columns = [], rows = [], empty = 'No data', rowKey = 'id', onRowClick }) {
  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key || c.header}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r[rowKey] ?? JSON.stringify(r)} onClick={() => onRowClick && onRowClick(r)} style={{ cursor: onRowClick ? 'pointer' : 'default' }}>
                {columns.map((c) => (
                  <td key={(c.key || c.header) + String(r[rowKey])}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
