import { login } from '../models/login-action.js';
import { LoginView } from '../view/components/login-view.js';

const view = new LoginView();

view.onSubmit(async (username, password) => {
  if (!username || !password) {
    view.showMessage('Please fill in all fields');
    return;
  }

  // Show loading state
  view.setLoading(true);
  view.clearMessage();

  try {
    const user = await login(username, password);

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));

      // Show success message
      view.showMessage('Login successful!', 'success');

      // Redirect based on role
      setTimeout(() => {
        if (user.role === 'admin') {
          view.redirectToHomePage();
        } else {
          view.showMessage('Access denied. Admin privileges required.');
        }
      }, 1000);
      
    } else {
      view.showMessage('Invalid username or password');
    }
  } catch (err) {
    view.showMessage('Login failed. Please try again later.');
    console.error(err);
  } finally {
    view.setLoading(false);
  }
});
