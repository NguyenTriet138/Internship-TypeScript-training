export type MessageType = 'error' | 'success';

export class LoginView {
  private form = document.getElementById('login-form') as HTMLFormElement;
  private messageBox = document.getElementById('form-message') as HTMLElement;

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
  }
}
