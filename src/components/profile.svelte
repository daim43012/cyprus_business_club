<script lang="ts">
  import Settings from "./profile/settings.svelte";
  import Tickets from "./profile/tickets.svelte";
  import Interests from "./profile/interests.svelte";
  import Profile from "./profile/profile.svelte";

  let activeTab: "settings" | "tickets" | "interests" = "settings";

  const setTab = (tab: "settings" | "tickets" | "interests") => {
    activeTab = tab;
  };
</script>

<div class="profile-wrapper">
  <h1>Profile settings</h1>

  <div class="layout">
    <!-- ЛЕВАЯ КОЛОНКА: профиль всегда -->
    <aside class="left">
      <Profile />
    </aside>

    <!-- ПРАВАЯ КОЛОНКА: вкладки + контент -->
    <section class="right">
      <div class="tabs">
        <span
          class="tab"
          class:active={activeTab === "settings"}
          on:click={() => setTab("settings")}
        >
          Settings
        </span>

        <span
          class="tab"
          class:active={activeTab === "tickets"}
          on:click={() => setTab("tickets")}
        >
          My tickets
        </span>

        <span
          class="tab"
          class:active={activeTab === "interests"}
          on:click={() => setTab("interests")}
        >
          Interests
        </span>
      </div>

      <div class="tab-content">
        {#if activeTab === "settings"}
          <Settings />
        {:else if activeTab === "tickets"}
          <Tickets />
        {:else if activeTab === "interests"}
          <Interests />
        {/if}
      </div>
    </section>
  </div>
</div>

<style>
  .profile-wrapper {
    width: min(90%, 70rem);
    margin: 3rem auto;
    padding: 0 1rem;
  }

  h1 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #0b3954;
    margin-bottom: 1rem;
  }

  /* ДВЕ КОЛОНКИ */
  .layout {
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 2rem;
    align-items: start;
  }

  /* Чтобы карточка профиля выглядела как "приклеенная" слева */
  .left {
    position: sticky;
    top: 1.5rem;
  }

  .tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 0.5rem;
  }

  .tab {
    font-size: 1rem;
    color: #64748b;
    cursor: pointer;
    padding-bottom: 0.3rem;
    position: relative;
    transition: all 0.2s ease;
  }

  .tab:hover {
    color: #0b3954;
  }

  .tab.active {
    color: #0b3954;
    font-weight: 600;
  }

  .tab.active::after {
    content: "";
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 100%;
    height: 2px;
    background: #0b3954;
    border-radius: 2px;
  }

  .tab-content {
    margin-top: 1rem;
  }

  @media (max-width: 900px) {
    .layout {
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    .left {
      position: static; /* отключаем sticky */
    }

    /* Табы: чтобы не ломались, а скроллились */
    .tabs {
      gap: 0.75rem;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none; /* firefox */
    }

    .tabs::-webkit-scrollbar {
      display: none; /* chrome */
    }

    .tab {
      white-space: nowrap;
      flex: 0 0 auto;
    }
  }
</style>
