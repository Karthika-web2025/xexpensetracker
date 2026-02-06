function Modal({ show, children }) {
  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        {/* <button className="close-btn" onClick={onClose}>X</button> */}
        {children}
      </div>
      
    </div>
  );
}

export default Modal;
