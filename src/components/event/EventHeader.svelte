<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import Paypal from "../paypal.svelte";

  export let data: any;

  const event = data.event;
  let isRegistered = data.isRegistered || false;
  const categories = event?.categories ?? [];
  let payStatus: "idle" | "success" | "error" = "idle";
  let autoCloseTimer: ReturnType<typeof setTimeout> | null = null;

  let copied = false;

  // Modal state
  let payOpen = false;
  let payError: string | null = null;

  const price = Number(event?.price ?? 0);
  const isPaidEvent = price > 0;

  async function registerFree() {
    const res = await fetch(`/api/events/${event.id}/register`, {
      method: "POST",
    });
    if (!res.ok) return;
    isRegistered = true;
  }

  async function onRegisterClick() {
    if (isRegistered) return;

    // free -> direct registration
    if (!isPaidEvent) {
      await registerFree();
      return;
    }

    // paid -> open modal with PayPal buttons
    payError = null;
    payOpen = true;
  }

  function closePayModal() {
    payOpen = false;
    payError = null;
  }

  function onPaypalSuccess() {
    isRegistered = true;
    payError = null;
    payStatus = "success";

    if (autoCloseTimer) clearTimeout(autoCloseTimer);

    autoCloseTimer = setTimeout(() => {
      closePayModal();
      window.location.reload();
    }, 1500);
  }

  function onPaypalError(e: any) {
    payStatus = "error";
    payError =
      e?.detail?.message ||
      (typeof e?.detail?.err === "string" ? e.detail.err : null) ||
      "Payment failed. Please try again.";
  }

  function onPaypalFree() {
    // just in case - if create returns {free:true}
    isRegistered = true;
    closePayModal();
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") closePayModal();
  }

  async function copyLink() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);

      copied = true;
      setTimeout(() => (copied = false), 1500);
    }
  }
</script>

<div class="header-block">
  <div>
    {#if event.photo}
      <img
        class="cover"
        src={event.photo
          ? `/api/photo/${event.photo.split("/").pop()}`
          : "/assets/images/placeholder-event.jpg"}
        alt={event.title}
      />

      {#if categories.length}
        <div class="chips">
          {#each categories as c}
            <span class="chip">{c.name}</span>
          {/each}
        </div>
      {/if}
    {/if}
  </div>

  <div class="header-info">
    <h1>{event.title}</h1>
    <p class="subtitle">{event.description}</p>

    <div class="meta">
      <p>
        <strong>📅 Дата:</strong>
        {new Date(event.date).toLocaleDateString("ru-RU")}
      </p>

      {#if event.organizer}
        <p>
          <strong>👤 Организатор:</strong>
          <a class="organizer-link" href={`/members/${event.organizer.id}`}>
            {event.organizer.info?.name || event.organizer.email}
          </a>
        </p>
      {/if}

      {#if isPaidEvent}
        <p>
          <strong>💳 Price:</strong> €{price.toFixed(2)}
        </p>
      {/if}
    </div>

    <div class="actions">
      {#if isRegistered}
        <button class="btn registered" disabled>Вы уже идёте ✔</button>
      {:else}
        <button class="btn primary" on:click={onRegisterClick}>
          {isPaidEvent ? "Buy ticket" : "Зарегистрироваться"}
        </button>
      {/if}

      <button class="btn" type="button" on:click={copyLink}>
        {copied ? "Copied ✅" : "Share"}
      </button>
    </div>
  </div>
</div>

{#if payOpen}
  <div
    class="modal-backdrop"
    on:click|self={closePayModal}
    on:keydown={onKeydown}
    tabindex="0"
  >
    <div class="modal-window">
      <div class="modal-head">
        <div>
          <div class="modal-title">Complete payment</div>
          <div class="modal-subtitle">{event.title}</div>
        </div>

        <button
          class="icon-btn"
          type="button"
          on:click={closePayModal}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div class="modal-body">
        <div class="price-row">
          <span>Total</span>
          <strong>€{price.toFixed(2)}</strong>
        </div>

        {#if payStatus === "success"}
          <div class="pay-success">
            ✅ Payment successful
            <div class="pay-success-hint">
              This window will close automatically in 5 seconds
            </div>
          </div>
        {:else}
          {#if payError}
            <div class="pay-error">{payError}</div>
          {/if}

          <div class="paypal-box">
            <Paypal
              eventId={event.id}
              on:success={onPaypalSuccess}
              on:error={onPaypalError}
              on:free={onPaypalFree}
            />
          </div>
        {/if}

        <div class="modal-hint">
          By proceeding, you agree to complete the payment to register for this
          event.
        </div>
      </div>

      <div class="modal-foot">
        <button class="btn" type="button" on:click={closePayModal}
          >Cancel</button
        >
      </div>
    </div>
  </div>
{/if}

<style>
  .header-block {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 16px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 14px;
  }
  .pay-success {
    border: 1px solid #bbf7d0;
    background: #ecfdf5;
    color: #166534;
    padding: 14px;
    border-radius: 12px;
    font-size: 15px;
    text-align: center;
  }

  .pay-success-hint {
    margin-top: 6px;
    font-size: 12px;
    color: #065f46;
  }

  .cover {
    width: 100%;
    height: 220px;
    object-fit: cover;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  }

  .chips {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .chip {
    font-size: 12px;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    color: #111827;
    line-height: 1;
    white-space: nowrap;
  }

  .header-info h1 {
    margin: 0 0 6px;
    font-size: 26px;
    color: #111827;
  }

  .subtitle {
    margin: 0 0 12px;
    color: #4b5563;
    line-height: 1.35;
  }

  .meta {
    display: grid;
    gap: 6px;
    color: #374151;
    margin-bottom: 12px;
  }

  .organizer-link {
    color: #1d4ed8;
    text-decoration: none;
  }

  .organizer-link:hover {
    text-decoration: underline;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .btn {
    border: 1px solid #d1d5db;
    background: #f9fafb;
    border-radius: 999px;
    padding: 10px 14px;
    cursor: pointer;
    font-size: 14px;
  }

  .btn:hover {
    background: #f3f4f6;
  }

  .btn.primary {
    background: #1e3a8a;
    border-color: #1e3a8a;
    color: #fff;
  }

  .btn.primary:hover {
    background: #2563eb;
  }

  .btn.registered {
    background: #ecfdf5;
    border-color: #bbf7d0;
    color: #166534;
    cursor: default;
  }

  /* ---- Modal ---- */
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
    max-height: 90vh;
    background: #fff;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(0, 0, 0, 0.05);
    color: #0b3954;

    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    animation: slideUp 0.25s ease;
  }

  .modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-title {
    font-weight: 700;
    color: #111827;
  }

  .modal-subtitle {
    font-size: 13px;
    color: #6b7280;
    margin-top: 2px;
  }

  .icon-btn {
    border: 1px solid #e5e7eb;
    background: #fff;
    border-radius: 10px;
    padding: 6px 10px;
    cursor: pointer;
  }

  .icon-btn:hover {
    background: #f9fafb;
  }

  .modal-body {
    padding: 16px;
    display: grid;
    gap: 12px;
  }

  .price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #f9fafb;
  }

  .pay-error {
    border: 1px solid #fecaca;
    background: #fef2f2;
    color: #7f1d1d;
    padding: 10px 12px;
    border-radius: 12px;
    font-size: 14px;
  }

  .paypal-box {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 12px;
    background: #fff;
  }

  .modal-hint {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.35;
  }

  .modal-foot {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 12px 16px;
    border-top: 1px solid #e5e7eb;
    background: #fff;
  }

  @media (max-width: 800px) {
    .header-block {
      grid-template-columns: 1fr;
    }

    .cover {
      height: 200px;
    }
  }
</style>
