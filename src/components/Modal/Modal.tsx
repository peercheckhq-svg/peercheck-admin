"use client";

import { ReactNode, useEffect } from "react";
import styles from "./styles/Modal.module.css";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  contentClassName?: string;
  hideCloseButton?: boolean;
};

function Modal({
  isOpen,
  onClose,
  header,
  footer,
  children,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = "",
  contentClassName = "",
  hideCloseButton = false,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`${styles.backdrop} ${className}`.trim()}
      onClick={closeOnBackdropClick ? onClose : undefined}
      role="presentation"
    >
      <div
        className={`${styles.modal} ${contentClassName}`.trim()}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        {(header || !hideCloseButton) && (
          <div className={styles.header}>
            <div className={styles.headerContent}>{header}</div>
            {!hideCloseButton && (
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close modal"
              >
                ×
              </button>
            )}
          </div>
        )}

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
