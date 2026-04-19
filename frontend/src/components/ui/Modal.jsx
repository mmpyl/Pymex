const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header style={styles.header}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={styles.close}>✕</button>
        </header>
        {children}
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.5)', display: 'grid', placeItems: 'center', zIndex: 100 },
  modal: { width: 'min(640px, 92vw)', background: '#fff', borderRadius: 14, padding: 16 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  close: { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18 }
};

export default Modal;
