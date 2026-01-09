<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import OtpInput from "./OtpInput.svelte";

  export let open = false;
  export let wallet: string = "";

  const dispatch = createEventDispatcher();

  let amount = "";
  let to = "";
  let otp = "";
  let error = "";
  let loading = false;
  let pending = false;

  async function submit() {
    error = "";
    loading = true;
    pending = true;

    let validationError = "";

    if (!to) {
      validationError = "Введите адрес получателя";
    } else if (!amount || Number(amount) <= 0) {
      validationError = "Введите корректную сумму";
    } else if (!otp || otp.length !== 6) {
      validationError = "Введите 6-значный код";
    }

    if (validationError) {
      error = validationError;
      loading = false;
      pending = false;
      return;
    }

    try {
      const res = await fetch("/api/custody/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          currency: "USDT",
          chain: "Polygon",
          to,
          token: otp,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        error = data.error || "Ошибка";
        return;
      }

      dispatch("success");
    } catch (e) {
      error = "Ошибка запроса";
    } finally {
      loading = false;
      pending = false;
    }
  }

  function close() {
    dispatch("close");
  }
</script>

{#if open}
  <div class="modal-backdrop" on:click={close}>
    <div class="modal-window" on:click|stopPropagation>
      <h2>Вывести</h2>

      <label>Адрес получателя</label>
      <input bind:value={to} placeholder="0x..." />

      <label>Сумма</label>
      <input type="number" bind:value={amount} placeholder="0.00" />

      <label>Код подтверждения</label>
      <OtpInput
        length={6}
        on:change={(e) => (otp = e.detail)}
        disabled={loading}
      />

      {#if error}
        <p class="error">{error}</p>
      {/if}

      <button class="btn primary" disabled={loading} on:click={submit}>
        {loading ? "Отправляем..." : "Вывести"}
      </button>

      <button class="btn secondary" on:click={close}>Отмена</button>
    </div>
  </div>
{/if}

<style>
  /* Затемнённый фон */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(2px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 500;
    animation: fadeIn 0.25s ease;
  }

  .modal-window {
    width: min(90%, 500px);
    background: #fff;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(0, 0, 0, 0.05);
    color: #0b3954;
    animation: slideUp 0.25s ease;
  }

  h2 {
    margin-bottom: 1.2rem;
    font-size: 1.8rem;
  }

  input {
    width: 100%;
    padding: 0.8rem;
    border-radius: 8px;
    border: 1px solid #cfd6dc;
    margin-bottom: 1rem;
    font-size: 1rem;
  }

  .btn {
    width: 100%;
    padding: 0.9rem 1.5rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    background: #0b3954;
    color: #fff;
    font-weight: 600;
    font-size: 1.1rem;
    margin-top: 0.5rem;
  }

  .btn.secondary {
    background: #99a2ad;
  }

  .error {
    color: #a83232;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
