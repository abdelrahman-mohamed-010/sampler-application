/* eslint-disable react/prop-types */
import { createPortal } from "react-dom";

const Modal = ({ open, children }) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      {children}
    </div>,
    document.getElementById("modal")
  );
};

export default Modal;
