<script lang="ts">
  import { generateQr } from "$lib/custody/qrcode";
  import { createEventDispatcher } from "svelte";

  export let open = false;
  export let wallet: string = "";

  const dispatch = createEventDispatcher();

  let error = "";
  let qr = "";

  // генерируем QR при открытии
  $: if (open && wallet) {
    loadQr();
  }

  async function loadQr() {
    try {
      qr = await generateQr(wallet);
    } catch (e) {
      error = "Не удалось создать QR-код";
    }
  }

  function copy() {
    navigator.clipboard.writeText(wallet);
  }

  function close() {
    dispatch("close");
  }
</script>

{#if open}
  <div class="modal-backdrop" on:click={close}>
    <div class="modal-window" on:click|stopPropagation>
      <h2>Пополнить</h2>

      <!-- <p>Ваш депозитный адрес:</p>

      <div class="wallet-box">
        <span>{wallet}</span>
        <button class="copy-btn" on:click={copy}>📋</button>
      </div> -->

      {#if qr}
        <img class="qr" src={qr} alt="QR код" />
      {/if}

      {#if error}
        <p class="error">{error}</p>
      {/if}

      <button class="btn secondary" on:click={close}>Закрыть</button>
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

  /* Окно модалки — стиль как у .custody-card */
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

  .modal-window h2 {
    margin: 0 0 1rem 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: #0b3954;
  }

  /* Адрес кошелька */
  .wallet-box {
    display: flex;
    align-items: center;
    background: #f3f7fa;
    border: 1px solid #cfd6dc;
    padding: 0.8rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 1rem;
    color: #0b3954;
  }

  .wallet-box span {
    flex: 1;
    word-break: break-all;
  }

  .copy-btn {
    background: #0b3954;
    color: white;
    padding: 0.4rem 0.7rem;
    border-radius: 6px;
    border: none;
    cursor: pointer;
  }

  /* QR-код */
  .qr {
    width: 240px;
    height: 240px;
    margin: 1rem auto;
    display: block;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }

  /* Inputs */
  input {
    width: 100%;
    padding: 0.8rem;
    border-radius: 8px;
    border: 1px solid #cfd6dc;
    margin-bottom: 1rem;
    font-size: 1rem;
    transition: border 0.2s;
  }

  input:focus {
    border-color: #0b3954;
    outline: none;
  }

  /* Labels */
  label {
    font-weight: 600;
    margin-bottom: 0.3rem;
    display: block;
  }

  /* Кнопки */
  .btn {
    width: 100%;
    padding: 0.9rem 1.5rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    background: #0b3954;
    color: #fff;
    font-weight: 600;
    transition: 0.2s;
    font-size: 1.1rem;
    margin-top: 0.5rem;
  }

  .btn:hover {
    opacity: 0.9;
  }

  .btn.secondary {
    background: #99a2ad;
  }

  .btn.secondary:hover {
    opacity: 0.85;
  }

  .error {
    color: #a83232;
    margin: 0.5rem 0;
    font-weight: 600;
    font-size: 0.95rem;
  }

  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
</style>
