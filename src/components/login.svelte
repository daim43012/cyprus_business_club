<script lang="ts">
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let errorMessage = '';
  let loading = false;

  // --- вход через email / password ---
  const handleSubmit = async () => {
    if (!email || !password) {
      errorMessage = 'Please fill in all fields';
      return;
    }

    try {
      loading = true;
      errorMessage = '';

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Logged in:', data.user);

        // редирект на главную (или профиль)
        goto('/');
      } else {
        const text = await res.text();
        errorMessage = text || 'Login failed. Please try again.';
      }
    } catch (err) {
      console.error('Login error:', err);
      errorMessage = 'Something went wrong.';
    } finally {
      loading = false;
    }
  };

  // --- вход через Google OAuth ---
  const handleGoogle = async () => {
    try {
      window.location.href = '/api/auth/google';
    } catch (err) {
      console.error('Google login error:', err);
    }
  };
</script>

<div class="auth-container">
  <div class="auth-card">
    <h1>Welcome Back 👋</h1>
    <p class="subtitle">Log in to continue your journey</p>

    <form on:submit|preventDefault={handleSubmit}>
      <!-- Email -->
      <label for="email">Email</label>
      <div class="input-group">
        <input
          id="email"
          type="email"
          placeholder="name@example.com"
          bind:value={email}
          required
        />
      </div>

      <!-- Password -->
      <label for="password">Password</label>
      <div class="input-group">
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          bind:value={password}
          required
        />
      </div>

      {#if errorMessage}
        <p class="error-message">{errorMessage}</p>
      {/if}

      <div class="extra-links">
        <a href="/forgot-password">Forgot password?</a>
      </div>

      <button type="submit" class="btn primary" disabled={loading}>
        {#if loading}
          Logging in...
        {:else}
          Log In
        {/if}
      </button>

      <div class="divider">or</div>

      <button type="button" class="btn google" on:click={handleGoogle}>
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
        />
        Sign in with Google
      </button>
    </form>

    <p class="footer-text">
      Don’t have an account?
      <a href="/register">Create one</a>
    </p>
  </div>
</div>

<style>
  /* Контейнер */
  .auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1; 
    min-height: 100vh;
  }

  /* Карточка */
  .auth-card {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    padding: 2.5rem 2rem;
    max-width: 400px;
    width: 100%;
    text-align: center;
  }

  .auth-logo {
    width: 64px;
    height: 64px;
    object-fit: contain;
    margin-bottom: 1rem;
  }

  h1 {
    font-size: 1.6rem;
    font-weight: 700;
    color: #0b3954;
    margin-bottom: 0.3rem;
  }

  .subtitle {
    color: #64748b;
    font-size: 0.9rem;
    margin-bottom: 2rem;
  }

  label {
    display: block;
    text-align: left;
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
    color: #334155;
  }

  .input-group {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: #f1f5f9;
    border-radius: 9999px;
    padding: 0.6rem 1rem;
    margin-bottom: 1.2rem;
    transition: all 0.2s ease;
    border: 1px solid transparent;
  }

  .input-group:hover {
    background: #e2e8f0;
    border: 1px solid #5ca5ff;
  }

  input {
    border: none;
    background: transparent;
    flex: 1;
    font-size: 1rem;
    outline: none;
    color: #0b3954;
  }

  .error-message {
    color: #e11d48;
    font-size: 0.85rem;
    margin-bottom: 1rem;
    text-align: left;
  }

  .extra-links {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
  }

  .extra-links a {
    font-size: 0.85rem;
    color: #0b3954;
    text-decoration: none;
    transition: opacity 0.2s ease;
  }

  .extra-links a:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  .divider {
    color: #94a3b8;
    margin: 1.5rem 0;
    position: relative;
  }

  .divider::before,
  .divider::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background: #cbd5e1;
  }

  .divider::before {
    left: 0;
  }

  .divider::after {
    right: 0;
  }

  .footer-text {
    margin-top: 1.5rem;
    font-size: 0.9rem;
    color: #334155;
  }

  .footer-text a {
    font-weight: 600;
    color: #0b3954;
    text-decoration: none;
  }

  .footer-text a:hover {
    text-decoration: underline;
  }

  .btn.google {
    background: white;
    color: #334155;
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
  }

  .btn.google img {
    width: 20px;
    height: 20px;
  }

  .btn.google:hover {
    background: #f9fafb;
  }
</style>
