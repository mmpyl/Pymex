import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({ open, title = 'Confirmar', description, onCancel, onConfirm }) => (
  <Modal open={open} title={title} onClose={onCancel}>
    <p className="text-slate-700">{description}</p>
    <div className="flex justify-end gap-2.5 mt-4">
      <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
      <Button onClick={onConfirm}>Confirmar</Button>
    </div>
  </Modal>
);

export default ConfirmDialog;
