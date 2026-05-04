const Select = ({ label, options = [], error, ...props }) => (
  <label className="grid gap-1.5">
    {label && <span className="text-sm text-gray-900 font-medium">{label}</span>}
    <select
      {...props}
      className="border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-gray-900"
    >
      {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    {error && <small className="text-red-600">{error}</small>}
  </label>
);

export default Select;
