import React, { createContext, useContext, useState, useCallback } from 'react';
import { FlowAlertModal, AlertType } from '@/components/common/FlowAlertModal';

export interface AlertOptions {
  title: string;
  message?: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  dismissible?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface ConfirmOptions {
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  showSuccess: (title: string, message?: string, onConfirm?: () => void) => void;
  showError: (title: string, message?: string, onConfirm?: () => void) => void;
  showWarning: (title: string, message?: string, onConfirm?: () => void) => void;
  showInfo: (title: string, message?: string, onConfirm?: () => void) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: ConfirmOptions
  ) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [modalState, setModalState] = useState<{
    visible: boolean;
    options: AlertOptions;
  }>({
    visible: false,
    options: {
      title: '',
    },
  });

  const hideAlert = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const showAlert = useCallback((options: AlertOptions) => {
    setModalState({
      visible: true,
      options,
    });
  }, []);

  const showSuccess = useCallback(
    (title: string, message?: string, onConfirm?: () => void) => {
      showAlert({
        title,
        message,
        type: 'success',
        confirmText: 'Entendido',
        onConfirm,
      });
    },
    [showAlert]
  );

  const showError = useCallback(
    (title: string, message?: string, onConfirm?: () => void) => {
      showAlert({
        title,
        message,
        type: 'error',
        confirmText: 'Cerrar',
        onConfirm,
      });
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (title: string, message?: string, onConfirm?: () => void) => {
      showAlert({
        title,
        message,
        type: 'warning',
        confirmText: 'Continuar',
        onConfirm,
      });
    },
    [showAlert]
  );

  const showInfo = useCallback(
    (title: string, message?: string, onConfirm?: () => void) => {
      showAlert({
        title,
        message,
        type: 'info',
        confirmText: 'Aceptar',
        onConfirm,
      });
    },
    [showAlert]
  );

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      options?: ConfirmOptions
    ) => {
      showAlert({
        title,
        message,
        type: 'confirm',
        confirmText: options?.confirmText || 'Confirmar',
        cancelText: options?.cancelText || 'Cancelar',
        isDestructive: options?.isDestructive ?? false,
        onConfirm,
        onCancel: options?.onCancel,
      });
    },
    [showAlert]
  );

  const handleConfirm = () => {
    const callback = modalState.options.onConfirm;
    hideAlert();
    if (callback) {
      callback();
    }
  };

  const handleCancel = () => {
    const callback = modalState.options.onCancel;
    hideAlert();
    if (callback) {
      callback();
    }
  };

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
        hideAlert,
      }}>
      {children}
      <FlowAlertModal
        visible={modalState.visible}
        type={modalState.options.type}
        title={modalState.options.title}
        message={modalState.options.message}
        confirmText={modalState.options.confirmText}
        cancelText={modalState.options.cancelText}
        isDestructive={modalState.options.isDestructive}
        dismissible={modalState.options.dismissible}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </AlertContext.Provider>
  );
}

export function useAlert(): AlertContextType {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert debe utilizarse dentro de un AlertProvider');
  }
  return context;
}
