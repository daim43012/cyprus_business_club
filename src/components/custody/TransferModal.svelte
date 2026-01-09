<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import OtpInput from "./OtpInput.svelte";

  export let open = false;

  const dispatch = createEventDispatcher();

  type FollowingUser = {
    id: string;
    email: string;
    custodyAddress: string | null;
    photo: string | null;
  };

  let users: FollowingUser[] = [];
  let selectedUserId: string = "";
  let selectedUserData: FollowingUser | null = null;

  let amount = "";
  let otp = ""; // ← 6-значный код!
  let error = "";
  let loading = false;
  let dropdownOpen = false;
  let pending = false;

  // Загрузка подписанных пользователей
  $: if (open) {
    loadUsers();
  }

  async function loadUsers() {
    try {
      const res = await fetch("/api/custody/following");
      const data = await res.json();

      users = data.ok ? (data.users as FollowingUser[]) : [];
    } catch {
      users = [];
    }
  }

  $: selectedUserData = users.find((u) => u.id === selectedUserId) ?? null;

 async function submit() {
  error = "";
  loading = true;
  pending = true;

  let validationError = "";

  if (!selectedUserData) {
    validationError = "Выберите пользователя";
  } else if (!otp || otp.length !== 6) {
    validationError = "Введите 6-значный код";
  } else if (!amount || Number(amount) <= 0) {
    validationError = "Введите корректную сумму";
  }

  if (validationError) {
    error = validationError;
    loading = false;
    pending = false;
    return;
  }

  const user = selectedUserData!;

  try {
    const res = await fetch("/api/custody/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(amount),
        currency: "USDT",
        chain: "Polygon",
        to: user.custodyAddress,
        toUserId: user.id,
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
    dropdownOpen = false;
    dispatch("close");
  }

  function choose(user: FollowingUser) {
    selectedUserId = user.id;
    dropdownOpen = false;
  }
</script>

{#if open}
  <div class="modal-backdrop" on:click={close}>
    <div class="modal-window" on:click|stopPropagation>
      <h2>Перевести</h2>

      <label>Кому перевести</label>

      <!-- DROPDOWN -->
      <div class="dropdown">
        <div
          class="dropdown-selected"
          on:click={() => (dropdownOpen = !dropdownOpen)}
        >
          {#if selectedUserData}
            <img
              class="photo"
              src={selectedUserData.photo ||
                "/assets/images/user-male-circle.jpg"}
            />
            <span>{selectedUserData.email}</span>
          {:else}
            <span class="placeholder-user">Выберите пользователя</span>
          {/if}

          <span class="arrow">▼</span>
        </div>

        {#if dropdownOpen}
          <div class="dropdown-list">
            {#each users as u}
              <div class="dropdown-item" on:click={() => choose(u)}>
                <img
                  class="photo"
                  src={u.photo || "/assets/images/user-male-circle.jpg"}
                />
                <span>{u.email}</span>
              </div>
            {/each}
            {#if users.length === 0}
              <div class="dropdown-empty">Нет доступных пользователей</div>
            {/if}
          </div>
        {/if}
      </div>

      <label>Сумма</label>
      <input type="number" bind:value={amount} placeholder="0.00" />

      <!-- NEW: OTP INPUT -->
      <label>Код подтверждения</label>
      <OtpInput length={6} on:change={(e) => (otp = e.detail)} />

      {#if error}
        <p class="error">{error}</p>
      {/if}

      <button class="btn primary" on:click={submit} disabled={loading}>
        {loading ? "Отправляем..." : "Перевести"}
      </button>

      <button class="btn secondary" on:click={close}>Отмена</button>
    </div>
  </div>
{/if}

<style>
  /* ---------- Modal Styles ---------- */
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

  .dropdown {
    position: relative;
    margin-bottom: 1rem;
  }

  .dropdown-selected {
    display: flex;
    align-items: center; /* ⭐️ фикс вертикальной полосы */
    gap: 0.6rem;

    background: #fff;
    border: 1px solid #cfd6dc;
    padding: 0.7rem 0.9rem; /* Слегка уменьшено */
    border-radius: 10px;
    cursor: pointer;

    height: 48px; /* ⭐️ фиксированная высота как у инпутов */
    box-sizing: border-box;
  }


  .photo {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0; /* ⭐️ не сжимается */
  }

  .placeholder {
    opacity: 0.6;
  }

  .arrow {
    margin-left: auto;
    opacity: 0.5;
    font-size: 0.8rem;
    pointer-events: none;
  }

  .dropdown-list {
    position: absolute;
    top: 52px; /* идеально под selected */
    left: 0;
    right: 0;

    background: #fff;
    border: 1px solid #cfd6dc;
    border-radius: 10px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    max-height: 240px;
    overflow-y: auto;
    z-index: 200;

    animation: fadeIn 0.15s ease;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.7rem 1rem;
    cursor: pointer;
  }

  .dropdown-item:hover {
    background: rgba(11, 57, 84, 0.05);
  }

  .dropdown-empty {
    padding: 1rem;
    text-align: center;
    opacity: 0.6;
    font-size: 0.95rem;
  }

  .photo {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }

  /* Inputs + Buttons */
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

  /* Animations */
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
