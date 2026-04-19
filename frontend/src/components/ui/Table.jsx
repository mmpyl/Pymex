const Table = ({ columns = [], rows = [] }) => (
  <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 12 }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead style={{ background: '#f8fafc' }}>
        <tr>{columns.map((c) => <th key={c.key} style={styles.th}>{c.label}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx} style={{ borderTop: '1px solid #f1f5f9' }}>
            {columns.map((c) => <td key={c.key} style={styles.td}>{row[c.key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const styles = {
  th: { textAlign: 'left', padding: '12px 14px', fontSize: 13, color: '#334155' },
  td: { padding: '12px 14px', fontSize: 14, color: '#0f172a' }
};

export default Table;
