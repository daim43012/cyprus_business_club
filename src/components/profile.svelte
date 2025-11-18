<script lang="ts">
  import Settings from "./profile/settings.svelte";
  import Tickets from "./profile/tickets.svelte";
  import Interests from "./profile/interests.svelte";
  import Profile from "./profile/profile.svelte";

  // Текущая активная вкладка
  let activeTab: "profile" | "settings" | "tickets" | "interests" = "profile";

  // Функция для переключения
  const setTab = (tab: "profile" | "settings" | "tickets" | "interests") => {
    activeTab = tab;
  };
</script>

<div class="profile-wrapper">
  <h1>Profile settings</h1>

  <div class="tabs">
    <span
      class="tab"
      class:active={activeTab === "profile"}
      on:click={() => setTab("profile")}
    >
      Profile
    </span>

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

  <!-- Контент вкладок -->
  <div class="tab-content">
    {#if activeTab === "profile"}
      <div class="profile-tab">
        <Profile />
      </div>
    {:else if activeTab === "settings"}
      <Settings />
    {:else if activeTab === "tickets"}
      <Tickets />
    {:else if activeTab === "interests"}
      <Interests />
    {/if}
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

  .tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
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
    margin-top: 1.5rem;
  }

  /* прижимаем только вкладку Profile влево */
  .profile-tab {
    display: flex;
    justify-content: flex-start;
  }

  .profile-tab :global(.profile-card) {
    margin-left: 0;
    margin-right: auto;
  }
</style>
