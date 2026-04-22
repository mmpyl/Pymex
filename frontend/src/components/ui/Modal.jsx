const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/50 grid place-items-center z-[100]" 
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[640px] max-w-[92vw] bg-white rounded-xl p-4" 
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center mb-3">
          <h3 className="m-0 text-lg font-semibold text-slate-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="border-none bg-transparent cursor-pointer text-lg hover:bg-slate-100 rounded-md p-1 transition-colors"
          >
            ✕
          </button>
        </header>
        <div className="text-slate-700">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
