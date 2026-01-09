<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  let dataLoaded = false;
  let loadError: string | null = null;

  let categories: { id: string; name: string }[] = [];
  let user: any = null;

  let selectedCategoryIds: string[] = [];
  let industryDropdownOpen = false;
  let industryDropdownRef: HTMLElement;

  let industrySearch = "";

  let saving = false;
  let saveError: string | null = null;
  let saveOk = false;

  let emailEnabled = false;
  let telegramEnabled = false;
  let emailFrequency = "daily";
  let telegramFrequency = "daily";
  let emailTime = "12:00";
  let telegramTime = "";

  let initialCategoryIds: string[] = [];
  let initialEmailEnabled = false;
  let initialTelegramEnabled = false;
  let initialEmailFrequency = "daily";
  let initialTelegramFrequency = "daily";
  let initialEmailTime = "12:00";
  let initialTelegramTime = "";

  const toggleCategory = (id: string) => {
    if (selectedCategoryIds.includes(id)) {
      selectedCategoryIds = selectedCategoryIds.filter((x) => x !== id);
    } else {
      selectedCategoryIds = [...selectedCategoryIds, id];
    }
  };

  $: filteredCategories =
    industrySearch.trim().length === 0
      ? categories
      : categories.filter((c) =>
          c.name.toLowerCase().includes(industrySearch.trim().toLowerCase())
        );

  $: selectedItems = categories.filter((c) =>
    selectedCategoryIds.includes(c.id)
  );

  const MAX_CHIPS = 4;
  $: visibleChips = selectedItems.slice(0, MAX_CHIPS);
  $: hiddenCount = Math.max(0, selectedItems.length - MAX_CHIPS);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      industryDropdownRef &&
      !industryDropdownRef.contains(event.target as Node)
    ) {
      industryDropdownOpen = false;
    }
  };

  const sameSet = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const sa = [...a].sort();
    const sb = [...b].sort();
    for (let i = 0; i < sa.length; i++) if (sa[i] !== sb[i]) return false;
    return true;
  };

  $: isChanged =
    !sameSet(selectedCategoryIds, initialCategoryIds) ||
    emailEnabled !== initialEmailEnabled ||
    telegramEnabled !== initialTelegramEnabled ||
    emailFrequency !== initialEmailFrequency ||
    telegramFrequency !== initialTelegramFrequency ||
    emailTime !== initialEmailTime ||
    telegramTime !== initialTelegramTime;

  onMount(async () => {
    document.addEventListener("click", handleClickOutside);

    try {
      const res = await fetch("/api/user/profile");
      if (!res.ok) throw new Error("Failed to load profile");

      const json = await res.json();

      user = json;
      categories = json.categories ?? [];

      selectedCategoryIds = (user?.interests ?? []).map((c: any) => c.id);

      emailEnabled = !!user?.settings?.emailSend;
      telegramEnabled = !!user?.settings?.chatBotSend;

      emailFrequency = user?.settings?.emailFrequency ?? "daily";
      telegramFrequency = user?.settings?.telegramFrequency ?? "daily";
      emailTime = user?.settings?.emailTime ?? "12:00";
      telegramTime = user?.settings?.telegramTime ?? "";

      initialCategoryIds = [...selectedCategoryIds];
      initialEmailEnabled = emailEnabled;
      initialTelegramEnabled = telegramEnabled;
      initialEmailFrequency = emailFrequency;
      initialTelegramFrequency = telegramFrequency;
      initialEmailTime = emailTime;
      initialTelegramTime = telegramTime;

      dataLoaded = true;
    } catch (e) {
      console.error(e);
      loadError = "Не удалось загрузить профиль.";
    }
  });

  onDestroy(() => {
    document.removeEventListener("click", handleClickOutside);
  });

  const handleSave = async () => {
    saveOk = false;
    saveError = null;
    saving = true;

    try {
      const fd = new FormData();

      fd.set("categoryIds", JSON.stringify(selectedCategoryIds));
      fd.set("emailEnabled", String(emailEnabled));
      fd.set("telegramEnabled", String(telegramEnabled));
      fd.set("emailFrequency", emailFrequency);
      fd.set("telegramFrequency", telegramFrequency);
      fd.set("emailTime", emailTime);
      fd.set("telegramTime", telegramTime);

      const res = await fetch("/api/user/profile", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Save failed");
      }

      const updated = await res.json();

      user = updated;

      selectedCategoryIds = (updated?.interests ?? []).map((c: any) => c.id);

      if (typeof updated?.settings?.emailSend === "boolean") {
        emailEnabled = updated.settings.emailSend;
      }

      if (typeof updated?.settings?.chatBotSend === "boolean") {
        telegramEnabled = updated.settings.chatBotSend;
      }

      emailFrequency = updated?.settings?.emailFrequency ?? emailFrequency;
      telegramFrequency =
        updated?.settings?.telegramFrequency ?? telegramFrequency;
      emailTime = updated?.settings?.emailTime ?? emailTime;
      telegramTime = updated?.settings?.telegramTime ?? telegramTime;

      initialCategoryIds = [...selectedCategoryIds];
      initialEmailEnabled = emailEnabled;
      initialTelegramEnabled = telegramEnabled;
      initialEmailFrequency = emailFrequency;
      initialTelegramFrequency = telegramFrequency;
      initialEmailTime = emailTime;
      initialTelegramTime = telegramTime;

      saveOk = true;
      setTimeout(() => (saveOk = false), 1500);
    } catch (e: any) {
      console.error(e);
      saveError = e?.message || "Ошибка сохранения.";
    } finally {
      saving = false;
    }
  };
</script>

{#if loadError}
  <p class="error">{loadError}</p>
{:else if !dataLoaded}
  <p class="loader">Загрузка...</p>
{:else}
  <div class="form-field" bind:this={industryDropdownRef}>
    <label>Interests</label>

    <div class="dropdown-wrapper">
      <button
        type="button"
        class="dropdown-header"
        on:click={() => (industryDropdownOpen = !industryDropdownOpen)}
      >
        {#if selectedCategoryIds.length > 0}
          <div
            class="chips chips-inline"
            title={selectedItems.map((x) => x.name).join(", ")}
          >
            {#each visibleChips as c (c.id)}
              <span class="chip">{c.name}</span>
            {/each}
            {#if hiddenCount > 0}
              <span class="chip chip-more">+{hiddenCount}</span>
            {/if}
          </div>
        {:else}
          <span >Select interests</span>
        {/if}

        <svg
          class:rotated={industryDropdownOpen}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
          />
        </svg>
      </button>

      {#if industryDropdownOpen}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="dropdown-list floating" on:click|stopPropagation>
          <div class="dropdown-search">
            <input
              type="text"
              placeholder="Search..."
              bind:value={industrySearch}
              autocomplete="off"
            />
          </div>

          {#if filteredCategories.length === 0}
            <div class="dropdown-empty">Ничего не найдено</div>
          {:else}
            <div class="dropdown-scroll">
              {#each filteredCategories as option (option.id)}
                <label class="dropdown-item" for={"cat-" + option.id}>
                  <span>{option.name}</span>
                  <input
                    id={"cat-" + option.id}
                    type="checkbox"
                    checked={selectedCategoryIds.includes(option.id)}
                    on:change={() => toggleCategory(option.id)}
                  />
                </label>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <h3>I want to receive notifications on:</h3>

  <div class="notify-option">
    <div class="notify-header">
      <img
        src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4e7.svg"
        alt="mail"
      />
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
      <img
        src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4e8.svg"
        alt="telegram"
      />
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

  <h3>Notification Frequency:</h3>

  <div class="freq-group">
    <h4>📧 E-mail</h4>
    <div class="freq-row">
      <div class="dropdown">
        <label>Frequency</label>
        <select bind:value={emailFrequency} disabled={!emailEnabled}>
          <option value="daily">daily</option>
          <option value="weekly">weekly</option>
          <option value="monthly">monthly</option>
        </select>
      </div>
      <div class="dropdown">
        <label>Notification Time</label>
        <input type="time" bind:value={emailTime} disabled={!emailEnabled} />
      </div>
    </div>
  </div>

  <div class="freq-group">
    <h4>💬 Chatbot Telegram</h4>
    <div class="freq-row">
      <div class="dropdown">
        <label>Frequency</label>
        <select bind:value={telegramFrequency} disabled={!telegramEnabled}>
          <option value="daily">daily</option>
          <option value="weekly">weekly</option>
          <option value="monthly">monthly</option>
        </select>
      </div>
      <div class="dropdown">
        <label>Notification Time</label>
        <input
          type="time"
          bind:value={telegramTime}
          disabled={!telegramEnabled}
        />
      </div>
    </div>
  </div>

  {#if saveError}
    <p class="error">{saveError}</p>
  {/if}
  {#if saveOk}
    <p class="ok">✅ Saved</p>
  {/if}

  <button
    class="btn primary"
    on:click={handleSave}
    disabled={!isChanged || saving}
  >
    {saving ? "Saving..." : "💾 Save changes"}
  </button>
{/if}

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
    max-width: 650px;
  }

  .dropdown-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    border: 1px solid #d1d5db;
    background: #f9fafb;
    border-radius: 999px;
    padding: 10px 14px;

    cursor: pointer;
    font-size: 14px;
    color: #111827;
    gap: 10px;
    text-align: left;
  }

  .dropdown-header:hover {
    background: #f3f4f6;
  }

  svg {
    transition: transform 0.2s ease;
    flex: 0 0 auto;
  }

  .rotated {
    transform: rotate(180deg);
  }

  .dropdown-list.floating {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 999;
    width: 100%;

    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 10px;

    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  }

  .dropdown-search {
    margin-bottom: 10px;
  }

  .dropdown-search input {
    width: 100%;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    border-radius: 999px;
    padding: 10px 14px;
    font-size: 14px;
    outline: none;
    color: #111827;
  }

  .dropdown-search input:focus {
    background: #fff;
  }

  .dropdown-scroll {
    max-height: 220px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .dropdown-item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 8px 6px;
    border-radius: 10px;

    font-size: 14px;
    color: #111827;
    cursor: pointer;
  }

  .dropdown-item:hover {
    background: #f9fafb;
  }

  .dropdown-item input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #1e3a8a;
  }

  .dropdown-empty {
    font-size: 14px;
    color: #6b7280;
    padding: 10px 6px;
  }

  .chips {
    display: flex;
    gap: 8px;
  }

  .chips-inline {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-wrap: nowrap;
    overflow: hidden;
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

    flex: 0 0 auto;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chip-more {
    background: #eef2ff;
    border-color: #c7d2fe;
    color: #1e3a8a;
  }

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

  select:disabled,
  input[type="time"]:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

  .error {
    color: #b91c1c;
    margin-top: 10px;
  }

  .ok {
    color: #166534;
    margin-top: 10px;
  }

  .loader {
    color: #475569;
  }
</style>
