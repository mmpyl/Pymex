import Input from './Input';
import Table from './Table';
import { useMemo, useState } from 'react';

const DataTable = ({ columns, rows }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  }, [rows, query]);

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <Input placeholder="Filtrar..." value={query} onChange={(e) => setQuery(e.target.value)} />
      <Table columns={columns} rows={filtered} />
    </div>
  );
};

export default DataTable;
