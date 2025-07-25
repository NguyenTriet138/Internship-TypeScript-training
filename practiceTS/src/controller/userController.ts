import { UserModel, User } from '../models/userClass.js';
import { LoginView } from '../view/components/loginView.js';

export class UserController {
  private view: LoginView;
  private model: UserModel;

  constructor() {
    this.view = new LoginView();
    this.model = new UserModel();
    this.init();
  }

  private init(): void {
    this.view.onSubmit(this.handleLogin.bind(this));
  }

  private async handleLogin(username: string, password: string): Promise<void> {
    if (!username || !password) {
      this.view.showMessage('Please fill in all fields');
      return;
    }

    this.view.setLoading(true);
    this.view.clearMessage();

    try {
      const user = await this.model.login(username, password);

      if (user) {
        this.model.saveUser(user);
        this.view.showMessage('Login successful!', 'success');

        setTimeout(() => {
          if (user.isAdmin()) {
            this.view.redirectToHomePage();
          } else {
            this.view.showMessage('Access denied. Admin privileges required.');
          }
        }, 1000);
      } else {
        this.view.showMessage('Invalid username or password');
      }

    } catch (error) {
      console.error('Login error:', error);
      this.view.showMessage('Login failed. Try again later.');
    } finally {
      this.view.setLoading(false);
    }
  }

  checkAdminAccess(): boolean {
    return this.model.isAdmin(this.model.getCurrentUser());
  }

  logout(): void {
    this.model.logout();
  }

  getCurrentUser(): User | null {
    return this.model.getCurrentUser();
  }
}

// Bootstrapping the controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new UserController();
});
