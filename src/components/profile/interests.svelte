<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  // ----- Мультивыбор индустрий -----
  const industryOptions = [
    "AI in Marketing",
    "AI in Healthcare",
    "Artificial Intelligence / Technology",
    "Innovation & Research",
    "Computer Science & Informatics",
    "Cybernetics & Informatics"
  ];

  let selectedIndustries: string[] = [];
  let industryDropdownOpen = false;
  let industryDropdownRef: HTMLElement;

  const toggleIndustry = (option: string) => {
    if (selectedIndustries.includes(option)) {
      selectedIndustries = selectedIndustries.filter((o) => o !== option);
    } else {
      selectedIndustries = [...selectedIndustries, option];
    }
  };

  const selectedIndustryLabel =
    selectedIndustries.length > 0
      ? selectedIndustries.join(", ")
      : "Select industries";

  const handleClickOutside = (event: MouseEvent) => {
    if (
      industryDropdownRef &&
      !industryDropdownRef.contains(event.target as Node)
    ) {
      industryDropdownOpen = false;
    }
  };

  onMount(() => {
    document.addEventListener("click", handleClickOutside);
  });
  onDestroy(() => {
    document.removeEventListener("click", handleClickOutside);
  });

  // ----- Остальные настройки -----
  let emailEnabled = false;
  let telegramEnabled = false;
  let emailFrequency = "daily";
  let telegramFrequency = "daily";
  let emailTime = "12:00";
  let telegramTime = "";
  let isChanged = false;

  $: isChanged =
    selectedIndustries.length > 0 ||
    emailEnabled ||
    telegramEnabled ||
    emailFrequency !== "daily" ||
    telegramFrequency !== "daily" ||
    emailTime !== "12:00" ||
    telegramTime !== "";

  const handleSave = () => {
    console.log("✅ Preferences saved:", {
      selectedIndustries,
      emailEnabled,
      telegramEnabled,
      emailFrequency,
      telegramFrequency,
      emailTime,
      telegramTime,
    });
    isChanged = false;
  };
</script>

<!-- ============ INDUSTRY MULTISELECT DROPDOWN ============ -->
<div class="form-field" bind:this={industryDropdownRef}>
  <label>Industry</label>
  <div class="dropdown-wrapper">
    <div
      class="dropdown-header"
      on:click={() => (industryDropdownOpen = !industryDropdownOpen)}
    >
      <span>{selectedIndustryLabel}</span>
      <svg
        class:rotated={industryDropdownOpen}
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path
          fill-rule="evenodd"
          d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
        />
      </svg>
    </div>

    {#if industryDropdownOpen}
      <div class="dropdown-list floating">
        {#each industryOptions as option}
          <label class="dropdown-item">
            <span>{option}</span>
            <input
              type="checkbox"
              checked={selectedIndustries.includes(option)}
              on:change={() => toggleIndustry(option)}
            />
          </label>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- ============ NOTIFICATION CHANNELS ============ -->
<h3>I want to receive notifications on:</h3>

<div class="notify-option">
  <div class="notify-header">
    <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4e7.svg" alt="mail" />
    <span>E-Mail</span>
  </div>
  <label class="switch">
    <input type="checkbox" bind:checked={emailEnabled} />
    <span class="slider"></span>
  </label>
  <p class="notify-text">
    {#if emailEnabled}
      Email notifications enabled!
    {:else}
      Enable email notifications to stay updated!
    {/if}
  </p>
</div>

<div class="notify-option">
  <div class="notify-header">
    <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4e8.svg" alt="telegram" />
    <span>Chatbot Telegram</span>
  </div>
  <label class="switch">
    <input type="checkbox" bind:checked={telegramEnabled} />
    <span class="slider"></span>
  </label>
  <p class="notify-text">
    {#if telegramEnabled}
      Telegram notifications enabled!
    {:else}
      Telegram disabled
    {/if}
  </p>
</div>

<!-- ============ FREQUENCY SETTINGS ============ -->
<h3>Notification Frequency:</h3>

<div class="freq-group">
  <h4>📧 E-mail</h4>
  <div class="freq-row">
    <div class="dropdown">
      <label>Frequency</label>
      <select bind:value={emailFrequency}>
        <option value="daily">daily</option>
        <option value="weekly">weekly</option>
        <option value="monthly">monthly</option>
      </select>
    </div>
    <div class="dropdown">
      <label>Notification Time</label>
      <input type="time" bind:value={emailTime} />
    </div>
  </div>
</div>

<div class="freq-group">
  <h4>💬 Chatbot Telegram</h4>
  <div class="freq-row">
    <div class="dropdown">
      <label>Frequency</label>
      <select bind:value={telegramFrequency}>
        <option value="daily">daily</option>
        <option value="weekly">weekly</option>
        <option value="monthly">monthly</option>
      </select>
    </div>
    <div class="dropdown">
      <label>Notification Time</label>
      <input type="time" bind:value={telegramTime} />
    </div>
  </div>
</div>

<button class="btn primary" on:click={handleSave} disabled={!isChanged}>
  💾 Save changes
</button>

<style>
  label {
    font-weight: 500;
    color: #334155;
    margin-bottom: 0.3rem;
    display: block;
  }

  .dropdown-wrapper {
    position: relative;
    width: 100%;
    max-width: 450px;
  }

  .dropdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border: 1px solid #cbd5e1;
    border-radius: 9999px;
    padding: 0.6rem 1rem;
    cursor: pointer;
    color: #0b3954;
    transition: 0.2s;
  }

  .dropdown-header:hover {
    border-color: #5ca5ff;
    background: #f8fafc;
  }

  svg {
    transition: transform 0.2s ease;
  }

  .rotated {
    transform: rotate(180deg);
  }

  /* 🔹 Плавающий dropdown — поверх контента */
  .dropdown-list.floating {
    position: absolute;
    top: calc(100% + 0.3rem);
    left: 0;
    z-index: 999;
    width: 100%;
    background: #fff;
    border: 1px solid #cbd5e1;
    border-radius: 0.8rem;
    padding: 0.5rem 1rem;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    animation: fadeIn 0.2s ease;
  }

  .dropdown-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.4rem 0;
    font-size: 0.95rem;
    color: #0b3954;
  }

  .dropdown-item input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #16a34a;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* остальной стиль без изменений ↓ */
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-top: 1.8rem;
    margin-bottom: 0.8rem;
    color: #0b3954;
  }

  .notify-option {
    background: #fff;
    border-radius: 1rem;
    padding: 0.8rem 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }

  .notify-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 130px;
  }

  .notify-header img {
    width: 24px;
    height: 24px;
  }

  .notify-text {
    flex-grow: 1;
    color: #475569;
    font-size: 0.95rem;
  }

  /* toggle */
  .switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #cbd5e1;
    transition: 0.4s;
    border-radius: 24px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #4f46e5;
  }

  input:checked + .slider:before {
    transform: translateX(20px);
  }

  .freq-group {
    margin-top: 1.5rem;
  }

  .freq-group h4 {
    color: #0b3954;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .freq-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  select,
  input[type="time"] {
    width: 180px;
    padding: 0.6rem 1rem;
    border: 1px solid #cbd5e1;
    border-radius: 9999px;
    background: #fff;
    color: #0b3954;
    font-size: 1rem;
    outline: none;
    transition: 0.2s;
  }

  select:hover,
  input[type="time"]:hover {
    border-color: #5ca5ff;
    background: #f8fafc;
  }

  .btn.primary {
    margin-top: 1.8rem;
    background: #1e1b4b;
    color: white;
    border: none;
    border-radius: 9999px;
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .btn.primary:hover {
    background: #312e81;
  }

  .btn.primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #94a3b8;
  }
</style>
