<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";

  let name = "";
  let email = "";
  let password = "";
  let confirmPassword = "";
  let referral = "";
  let errorMessage = "";
  let successMessage = "";
  let loading = false;

  onMount(() => {
    const unsub = page.subscribe(async ($page) => {
      const ref = $page.url.searchParams.get("ref");
      if (ref) {
        referral = ref;
        document.cookie = `ref=${ref}; path=/; max-age=86400`;

        const res = await fetch(`/api/user/referral/check?code=${ref}`);
        const data = await res.json();
        if (!data.exists) {
          errorMessage = "This referral code does not exist.";
        } else {
          errorMessage = "";
        }
      }
    });

    return () => unsub();
  });

  const handleSubmit = async () => {
    if (!name || !email || !password || !confirmPassword) {
      errorMessage = "Please fill in all fields.";
      return;
    }

    if (password !== confirmPassword) {
      errorMessage = "Passwords do not match.";
      return;
    }

    errorMessage = "";
    successMessage = "";
    loading = true;

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          referral,
        }),
      });

      if (res.status === 201) {
        successMessage = "🎉 Account created successfully!";
        setTimeout(() => goto("/"), 1000);
      } else if (res.status === 409) {
        errorMessage = "User with this email already exists.";
      } else {
        const text = await res.text();
        errorMessage = `Registration failed: ${text}`;
      }
    } catch (err) {
      console.error("Registration error:", err);
      errorMessage = "An error occurred. Please try again later.";
    } finally {
      loading = false;
    }
  };

  const handleGoogle = () => {
    const ref = referral || new URL(location.href).searchParams.get("ref");
    window.location.href = `/api/auth/google${ref ? `?state=${ref}` : ""}`;
  };
  $: if (referral && referral.length >= 3) {
    checkReferral(referral);
  }

  async function checkReferral(code: string) {
    const res = await fetch(`/api/user/referral/check?code=${code}`);
    const data = await res.json();

    if (!data.exists) {
      errorMessage = "Referral code not found";
    } else {
      errorMessage = "";
    }
  }
</script>

<div class="auth-container">
  <div class="auth-card">
    <h1>Create an account 💻</h1>
    <p class="subtitle">Let's go through a few simple steps</p>

    <form on:submit|preventDefault={handleSubmit}>
      <!-- Full Name -->
      <label for="name">Full name</label>
      <div class="input-group">
        <input
          id="name"
          type="text"
          placeholder="John Doe"
          bind:value={name}
          required
        />
      </div>

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
          minlength="6"
        />
      </div>

      <!-- Confirm Password -->
      <label for="confirm">Confirm Password</label>
      <div class="input-group">
        <input
          id="confirm"
          type="password"
          placeholder="••••••••"
          bind:value={confirmPassword}
          required
        />
      </div>
      <label for="referral">Referral code (optional)</label>
      <div class="input-group">
        <input id="referral" type="text" bind:value={referral} maxlength="6" />
      </div>
      {#if errorMessage}
        <p class="error-message">{errorMessage}</p>
      {/if}

      {#if successMessage}
        <p class="success-message">{successMessage}</p>
      {/if}

      <button type="submit" class="btn primary" disabled={loading}>
        {#if loading}
          ⏳ Creating...
        {:else}
          Proceed
        {/if}
      </button>

      <div class="divider">or</div>

      <button type="button" class="btn google" on:click={handleGoogle}>
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
        />
        Continue with Google
      </button>
    </form>

    <p class="footer-text">
      Already have an account?
      <a href="/login">Sign In</a>
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
