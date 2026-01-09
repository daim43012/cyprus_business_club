<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  type Notification = {
    id: string;
    emoji?: string;
    textKey: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
  };

  let notifications: Notification[] = [];
  let unreadCount = 0;
  let open = false;

  let dropdownRef: HTMLDivElement | null = null;
  let bellBtnRef: HTMLButtonElement | null = null;

  async function loadNotifications() {
    const res = await fetch("/api/user/notifications");
    if (res.ok) {
      const data = await res.json();
      notifications = data.notifications;
      unreadCount = notifications.filter((n) => !n.isRead).length;
    }
  }

  async function markAllAsRead() {
    await fetch("/api/user/notifications/read-all", { method: "POST" });

    notifications = notifications.map((n) => ({ ...n, isRead: true }));
    unreadCount = 0;
  }

  async function openNotification(n: Notification) {
    if (!n.isRead) {
      await fetch("/api/user/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: n.id }),
      });

      n.isRead = true;
      unreadCount = notifications.filter((n) => !n.isRead).length;
    }

    if (n.link) window.location.href = n.link;
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Node;

    if (!open) return;

    if (dropdownRef && dropdownRef.contains(target)) return;
    if (bellBtnRef && bellBtnRef.contains(target)) return;

    open = false;
  }

  onMount(() => {
    loadNotifications();

    const interval = setInterval(loadNotifications, 1000);

    document.addEventListener("click", handleClickOutside);

    onDestroy(() => {
      clearInterval(interval);
      document.removeEventListener("click", handleClickOutside);
    });
  });
</script>

<div class="bell-container">
  <button
    class="bell-btn"
    bind:this={bellBtnRef}
    on:click|stopPropagation={() => (open = !open)}
  >
    <ion-icon name="notifications-outline" class="bell-icon"></ion-icon>

    {#if unreadCount > 0}
      <span class="badge">{unreadCount}</span>
    {/if}
  </button>

  {#if open}
    <div class="dropdown" bind:this={dropdownRef}>
      <div class="dropdown-header">
        <h4>Notifications</h4>

        {#if unreadCount > 0}
          <button class="read-all" on:click={markAllAsRead}>
            Mark all read
          </button>
        {/if}
      </div>

      {#if notifications.length === 0}
        <p class="empty">No notifications</p>
      {:else}
        <ul class="notif-list">
          {#each notifications as n}
            <li
              class="notif-item {n.isRead ? 'read' : 'unread'}"
              on:click={() => openNotification(n)}
            >
              <div class="emoji">{n.emoji ?? "🔔"}</div>

              <div class="text">
                <div class="msg">{n.textKey}</div>
                <small>{new Date(n.createdAt).toLocaleString("ru-RU")}</small>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* ===== Bell icon ===== */
  .bell-container {
    position: relative;
    display: inline-block;
  }

  .bell-btn {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .bell-icon {
    color: black;
    opacity: 0.85;
    font-size: 24px;
    transition:
      opacity 0.2s,
      transform 0.15s;
  }

  .bell-btn:hover .bell-icon {
    opacity: 1;
    transform: scale(1.05);
  }

  .badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ef4444;
    color: #fff;
    font-size: 10px;
    padding: 2px 5px;
    border-radius: 50%;
    font-weight: 600;
  }

  /* ===== Dropdown ===== */
  .dropdown {
    position: absolute;
    right: 0;
    top: 38px;
    width: 320px;
    background: white;
    border-radius: 14px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    z-index: 5000;
    padding: 1rem;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dropdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.8rem;
  }

  h4 {
    margin: 0;
    color: #0b3954;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .read-all {
    background: none;
    border: none;
    color: #0b3954;
    font-size: 0.78rem;
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 0.15s;
  }

  .read-all:hover {
    opacity: 1;
    text-decoration: underline;
  }

  .empty {
    color: #7b8794;
    text-align: center;
    padding: 1rem 0;
    font-size: 0.85rem;
  }

  /* ===== List ===== */
  .notif-list {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 280px;
    overflow-y: auto;
  }

  .notif-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 0.6rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .notif-item:hover {
    background: #eef6ff;
  }

  .emoji {
    font-size: 1.2rem;
    margin-top: 3px;
  }

  .text .msg {
    font-size: 0.92rem;
    color: #0b3954;
    line-height: 1.3;
  }

  small {
    color: #7b8794;
    font-size: 0.75rem;
  }

  .unread {
    background: #eaf3ff;
    border-left: 3px solid #0b3954;
  }

  .read {
    opacity: 0.55;
  }
</style>
