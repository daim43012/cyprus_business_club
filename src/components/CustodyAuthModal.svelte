<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { gotoWithRedirectPreserved } from "$lib/utils/navigation";

  export let email: string | null = null;
  export let open: boolean = false;
  export let address: string | null = null;
  const dispatch = createEventDispatcher();

  // login / register — переключение внутри модалки
  let mode: "login" | "register" = "login";

  let password = "";
  let error = "";
  let loading = false;

  // ---------------------------------------
  // LOGIN
  // ---------------------------------------
  async function handleLogin() {
    error = "";

    if (!email) {
      error = "Вы не авторизованы на платформе.";
      return;
    }

    if (!password || password.length < 4) {
      error = "Пароль слишком короткий.";
      return;
    }

    loading = true;

    try {
      const res = await fetch("/api/custody/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!data.ok) {
        loading = false;
        error = data.error || "Ошибка входа";
        return;
      }

      loading = false;

      dispatch("success");
    } catch {
      loading = false;
      error = "Ошибка соединения";
    }
  }

  async function handleRegister() {
    error = "";

    if (!email) {
      error = "Сначала войдите на платформе.";
      return;
    }

    if (!password || password.length < 4) {
      error = "Пароль слишком короткий.";
      return;
    }

    loading = true;

    try {
      const res = await fetch("/api/custody/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!data.ok) {
        loading = false;
        error = data.error || "Ошибка создания кошелька";
        return;
      }

      loading = false;

      dispatch("created", { wallet: data.wallet });
    } catch {
      loading = false;
      error = "Ошибка соединения";
    }
  }

  function switchMode(to: "login" | "register") {
    if (address) return;
    mode = to;
    password = "";
    error = "";
    loading = false;
  }
  if (address) {
    mode = "login";
  }
</script>

{#if open}
  <div class="backdrop" on:click={() => dispatch("close")}>
    <div class="modal-w" on:click|stopPropagation>
      {#if loading}
        <div class="loading-block">
          <div class="spinner"></div>
          <p>
            {mode === "register"
              ? "Создание кастодиального кошелька, пожалуйста подождите…"
              : "Выполняем вход…"}
          </p>
        </div>
      {:else}
        <h2>{mode === "login" ? "Вход" : "Создание кошелька"}</h2>

        {#if !email}
          <p class="alert">
            Вы не авторизованы на платформе.<br />
            <button
              class="alert"
              on:click={() => gotoWithRedirectPreserved("/login")}
            >
              Войти
            </button>
          </p>
        {:else}
          <p class="info">
            {mode === "login"
              ? `Вход для аккаунта ${email}`
              : `Создание кастодиального кошелька для ${email}`}
          </p>

          <input type="password" bind:value={password} placeholder="Пароль" />

          {#if error}
            <p class="error">{error}</p>
          {/if}

          <button
            class="btn primary"
            on:click={mode === "login" ? handleLogin : handleRegister}
          >
            {mode === "login" ? "Войти" : "Создать кошелёк"}
          </button>
          {#if !address}
            <button
              class="btn switch"
              on:click={() =>
                switchMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login"
                ? "У меня нет кошелка"
                : "У меня уже есть кошелек"}
            </button>
          {/if}
        {/if}

        <button class="btn secondary" on:click={() => dispatch("close")}>
          Закрыть
        </button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
  .modal-w {
    width: 90%;
    max-width: 420px;
    background: #fff;
    padding: 2rem;
    border-radius: 1rem;
    animation: fadeIn 0.16s ease;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  .info {
    margin-bottom: 1rem;
    opacity: 0.9;
  }
  .alert {
    background: #ffe6e6;
    padding: 1rem;
    border-radius: 0.6rem;
    margin-bottom: 1rem;
    color: #b42121;
  }
  input {
    width: 100%;
    padding: 0.9rem;
    border-radius: 8px;
    border: 1px solid #ddd;
    margin-bottom: 1rem;
    font-size: 1rem;
  }
  .btn {
    width: 100%;
    padding: 0.9rem;
    border-radius: 8px;
    border: none;
    margin-bottom: 0.7rem;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
  }
  .btn.primary {
    background: #0b3954;
    color: #fff;
  }
  .btn.secondary {
    background: #ccc;
  }
  .btn.switch {
    background: transparent;
    text-decoration: underline;
    color: #0b3954;
  }
  .error {
    color: #d9534f;
    margin-bottom: 1rem;
  }
  .loading {
    text-align: center;
    padding: 1rem 0;
  }
  .spinner {
    width: 42px;
    height: 42px;
    border: 4px solid #ccc;
    border-top-color: #0b3954;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    margin: 0 auto 1rem auto;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
