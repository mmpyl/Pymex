import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({ open, title = 'Confirmar', description, onCancel, onConfirm }) => (
  <Modal open={open} title={title} onClose={onCancel}>
    <p>{description}</p>
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
      <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
      <Button onClick={onConfirm}>Confirmar</Button>
    </div>
  </Modal>
);

export default ConfirmDialog;
