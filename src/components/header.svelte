<script lang="ts">
  import { onMount } from "svelte";
  import UserAvatar from "./userAvatar.svelte";
  import Notifications from "./notifications.svelte";

  let menuOpen = false;

  let unread = 0; // 🔥 количество непрочитанных сообщений

  // ============================
  // 🔥 Загрузка количества непрочитанных
  // ============================
  async function loadUnread() {
    try {
      const res = await fetch("/api/chat/unread");
      if (res.ok) {
        const data = await res.json();
        unread = data.unread ?? 0;
      }
    } catch (e) {
      console.error("Unread fetch error:", e);
    }
  }

  // ============================
  // 🔥 Polling каждые 1 сек
  // ============================
  onMount(() => {
    loadUnread();

    const interval = setInterval(loadUnread, 1000);

    return () => clearInterval(interval);
  });
</script>

<header>
  <div class="container">
    <!-- ЛОГО -->
    <div class="logo">
      <img src="/assets/images/cbc/logo-cbc-dark.svg" alt="Logo" />
    </div>

    <!-- БУРГЕР -->
    <button
      class="burger"
      on:click={() => (menuOpen = !menuOpen)}
      aria-label="Toggle menu"
      aria-expanded={menuOpen}
    >
      <span class="line" class:open={menuOpen}></span>
      <span class="line" class:open={menuOpen}></span>
      <span class="line" class:open={menuOpen}></span>
    </button>

    <!-- НАВИГАЦИЯ -->
    <nav class:open={menuOpen}>
      <a href="/">Events</a>
      <a href="/calendar">Calendar</a>
      <a href="/partners">Partners</a>
      <a href="/members">Members</a>
      <a href="/technologies">Technologies</a>
      <a href="/about">About</a>
    </nav>

    <div class="right-side">

      <!-- 🔥 CHAT ICON + BADGE -->
      <a href="/chat" class="chat-icon" aria-label="Chat">
        <div class="icon-wrap">
          <ion-icon name="chatbox-outline"></ion-icon>

          {#if unread > 0}
            <span class="badge">{unread}</span>
          {/if}
        </div>
      </a>
<Notifications />

      <UserAvatar showName={false} />
    </div>
  </div>
</header>

<style>
  header {
    background: white;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .icon-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  /* 🔥 ОБНОВЛЁННЫЙ БЕЙДЖ */
  .badge {
    position: absolute;
    top: -4px;
    right: -6px;
    background: #ef4444;
    color: white;
    font-size: 10px;
    font-weight: 700;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0.8rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo img {
    height: 38px;
  }

  nav {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  nav a {
    color: #334155;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  nav a:hover {
    color: #1e3a8a;
  }

  .burger {
    display: none;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
  }

  .line {
    width: 22px;
    height: 2px;
    background: #0b3954;
    border-radius: 2px;
    transition: 0.2s;
  }

  .line.open:nth-child(1) {
    transform: rotate(45deg) translateY(7px);
  }
  .line.open:nth-child(2) {
    opacity: 0;
  }
  .line.open:nth-child(3) {
    transform: rotate(-45deg) translateY(-7px);
  }

  .right-side {
    display: flex;
    align-items: center;
  }

  .chat-icon {
    margin-right: 16px;
    color: black;
    display: flex;
    align-items: center;
    font-size: 24px;
    opacity: 0.85;
    transition: opacity 0.2s, transform 0.15s;
  }

  .chat-icon:hover {
    opacity: 1;
    transform: scale(1.02);
  }

  .chat-icon ion-icon {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 768px) {
    nav {
      position: absolute;
      top: 64px;
      left: 0;
      right: 0;
      background: white;
      flex-direction: column;
      align-items: flex-start;
      padding: 1rem;
      gap: 0.8rem;
      border-top: 1px solid #e2e8f0;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
      display: none;
    }

    nav.open {
      display: flex;
    }

    .burger {
      display: flex;
    }

    .right-side :global(.username) {
      display: none;
    }

    .chat-icon {
      margin-right: 12px;
    }
  }
</style>
