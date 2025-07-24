const form = document.getElementById('login-form') as HTMLFormElement;
const messageBox = document.getElementById('form-message') as HTMLElement;

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = (document.getElementById('username') as HTMLInputElement).value.trim();
  const password = (document.getElementById('password') as HTMLInputElement).value;

  if (!username || !password) {
    showMessage('Please fill in all fields');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/users?username=${username}&password=${password}`);
    const users = await res.json();

    if (users.length === 1) {
      // Success: store user to localStorage
      localStorage.setItem('currentUser', JSON.stringify(users[0]));

      if (users[0].role !== 'admin') {
        // Redirect to user dashboard
        window.location.href = './login.html';
        showMessage('Login successful! Redirecting to user dashboard...', 'error');
      } else {
        // Redirect to admin dashboard
        window.location.href = './index.html';
        showMessage('Login successful!', 'success');
      }
      
    } else {
      showMessage('Invalid username or password');
    }
  } catch (error) {
    showMessage('Login failed. Please try again later.');
    console.error(error);
  }
});

function showMessage(msg: string, type: 'error' | 'success' = 'error') {
  messageBox.textContent = msg;
  messageBox.style.color = type === 'success' ? 'green' : 'red';
}
