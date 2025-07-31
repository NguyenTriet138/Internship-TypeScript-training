export type MessageType = 'error' | 'success';

export class LoginView {
  private form = document.getElementById('login-form') as HTMLFormElement;
  private messageBox = document.getElementById('form-message') as HTMLElement;
  private submitButton = document.querySelector('#login-form button[type="submit"]') as HTMLButtonElement;

  onSubmit(callback: (username: string, password: string) => void) {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();

      const username = (document.getElementById('username') as HTMLInputElement).value.trim();
      const password = (document.getElementById('password') as HTMLInputElement).value;

      callback(username, password);
    });
  }

  showMessage(msg: string, type: MessageType = 'error') {
    this.messageBox.textContent = msg;
    this.messageBox.style.color = type === 'success' ? 'green' : 'red';
    this.messageBox.style.display = 'block';
  }

  clearMessage() {
    this.messageBox.textContent = '';
    this.messageBox.style.display = 'none';
  }

  setLoading(isLoading: boolean) {
    if (this.submitButton) {
      this.submitButton.disabled = isLoading;
      this.submitButton.textContent = isLoading ? 'Logging in...' : 'Login';
    }
  }

  redirectToHomePage() {
    window.location.href = '/home';
  }

  redirectToLoginPage() {
    window.location.href = '/login';
  }
}
