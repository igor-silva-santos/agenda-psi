interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  // Remove toast anterior se existir
  const existingToast = document.getElementById('toast-notification');
  if (existingToast) {
    existingToast.remove();
  }

  // Criar elemento do toast
  const toast = document.createElement('div');
  toast.id = 'toast-notification';
  toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out translate-x-full`;
  
  // Definir cores baseadas no tipo
  const colors = {
    success: 'bg-emerald-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  };
  
  toast.className += ` ${colors[type]}`;
  
  // Ícones para cada tipo
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };
  
  toast.innerHTML = `
    <div class="flex items-center space-x-3">
      <span class="text-lg font-bold">${icons[type]}</span>
      <span class="font-medium">${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
        ×
      </button>
    </div>
  `;
  
  // Adicionar ao DOM
  document.body.appendChild(toast);
  
  // Animar entrada
  setTimeout(() => {
    toast.classList.remove('translate-x-full');
    toast.classList.add('translate-x-0');
  }, 100);
  
  // Auto-remover após 4 segundos
  setTimeout(() => {
    toast.classList.add('translate-x-full');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, 4000);
}

