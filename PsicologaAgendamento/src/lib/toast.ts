import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// A interface ToastProps não era necessária e foi removida.

export const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  toast(message, { type });
};

export { ToastContainer };
