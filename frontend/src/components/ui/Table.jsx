const Table = ({ columns = [], rows = [] }) => (
  <div className="overflow-x-auto border border-slate-200 rounded-xl">
    <table className="w-full border-collapse">
      <thead className="bg-slate-50">
        <tr>
          {columns.map((c) => (
            <th key={c.key} className="text-left px-3.5 py-3 text-sm font-medium text-slate-600">
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx} className="border-t border-slate-100">
            {columns.map((c) => (
              <td key={c.key} className="px-3.5 py-3 text-sm text-slate-800">
                {row[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Table;
