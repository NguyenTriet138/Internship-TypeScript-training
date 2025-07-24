import { login } from '../models/login-model.js';
import { LoginView } from '../view/components/login-view.js';

const view = new LoginView();

view.onSubmit(async (username, password) => {
  if (!username || !password) {
    view.showMessage('Please fill in all fields');
    return;
  }

  try {
    const user = await login(username, password);

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));

      if (user.role !== 'admin') {
        view.redirectToLoginPage();
      } else {
        view.redirectToHomePage();
      }
      
    } else {
      view.showMessage('Invalid username or password');
    }
  } catch (err) {
    view.showMessage('Login failed. Please try again later.');
    console.error(err);
  }
});
