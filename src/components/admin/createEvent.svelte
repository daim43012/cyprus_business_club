<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import "leaflet/dist/leaflet.css";

  interface Category {
    id: string;
    name: string;
  }

  type AgendaItem = {
    start: string; // "HH:MM"
    end?: string; // "HH:MM"
    title: string;
    description?: string;
  };

  let title = "";
  let description = "";
  let date = "";
  let location = "";
  let selectedCategories: string[] = [];
  let price = "";
  let photo: File | null = null;
  let documentFile: File | null = null;
  let photoPreview = "";
  let success = false;
  let error = "";
  let loading = false;
  let dropdownOpen = false;
  let categories: Category[] = [];

  let agendaItems: AgendaItem[] = [];

  let latitude = "";
  let longitude = "";
  let isMapVisible = false;
  let mapContainer: HTMLDivElement;
  let map: any;
  let marker: any;
  const toggleDropdown = (e: MouseEvent) => {
    e.stopPropagation();
    dropdownOpen = !dropdownOpen;
  };

  onMount(() => {
    let alive = true;

    const onDocClick = () => (dropdownOpen = false);
    document.addEventListener("click", onDocClick);

    (async () => {
      const res = await fetch("/api/categories");
      if (!alive) return;
      if (res.ok) categories = await res.json();
    })();

    return () => {
      alive = false;
      document.removeEventListener("click", onDocClick);
    };
  });

  const toggleCategory = (id: string) => {
    const selected = selectedCategories.includes(id);

    if (selected) {
      selectedCategories = selectedCategories.filter((c) => c !== id);
      return;
    }

    if (selectedCategories.length >= MAX_CATEGORIES) {
      error = `You can select up to ${MAX_CATEGORIES} categories.`;
      return;
    }

    selectedCategories = [...selectedCategories, id];
  };

  const handlePhotoUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files?.length) {
      photo = target.files[0];
      photoPreview = URL.createObjectURL(photo);
    }
  };

  const handleDocumentUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files?.length) {
      documentFile = target.files[0];
    }
  };
  let categoryQuery = "";
  const MAX_CATEGORIES = 12;

  $: filteredCategories =
    categoryQuery.trim().length === 0
      ? categories
      : categories.filter((c) =>
          c.name.toLowerCase().includes(categoryQuery.trim().toLowerCase())
        );

  const isLimitReached = () => selectedCategories.length >= MAX_CATEGORIES;

  // ---------- Agenda ----------
  const addAgendaItem = () => {
    agendaItems = [
      ...agendaItems,
      { start: "10:00", end: "11:00", title: "", description: "" },
    ];
  };

  const removeAgendaItem = (idx: number) => {
    agendaItems = agendaItems.filter((_, i) => i !== idx);
  };

  const updateAgendaItem = (idx: number, patch: Partial<AgendaItem>) => {
    agendaItems = agendaItems.map((it, i) =>
      i === idx ? { ...it, ...patch } : it
    );
  };

  const isValidHHMM = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

  // ---------- Map ----------
  async function getAddress(lat: number, lng: number) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`
    );
    const data = await res.json();
    if (data?.display_name) location = data.display_name;
    else location = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }

  async function initMap() {
    if (map) return;

    const L = await import("leaflet");

    const defaultLat = 52.52;
    const defaultLng = 13.405;

    map = L.map(mapContainer).setView([defaultLat, defaultLng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(map);

    marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);

    latitude = defaultLat.toFixed(6);
    longitude = defaultLng.toFixed(6);
    getAddress(defaultLat, defaultLng);

    marker.on("dragend", async () => {
      const { lat, lng } = marker.getLatLng();
      latitude = lat.toFixed(6);
      longitude = lng.toFixed(6);
      await getAddress(lat, lng);
    });

    map.on("click", async (e: any) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      latitude = lat.toFixed(6);
      longitude = lng.toFixed(6);
      await getAddress(lat, lng);
    });
  }

  const toggleMap = async () => {
    isMapVisible = !isMapVisible;
    if (isMapVisible) {
      await initMap();
      setTimeout(() => map.invalidateSize(), 200);
    }
  };

  // ---------- Submit ----------
  const handleSubmit = async () => {
    if (
      !title ||
      !description ||
      !date ||
      !location ||
      selectedCategories.length === 0
    ) {
      error = "Please fill all required fields.";
      return;
    }

    // минимальная валидация agenda на фронте (чтобы не ловить 400)
    for (let i = 0; i < agendaItems.length; i++) {
      const it = agendaItems[i];
      if (!isValidHHMM(it.start)) {
        error = `Agenda item #${i + 1}: invalid start time`;
        return;
      }
      if (it.end && !isValidHHMM(it.end)) {
        error = `Agenda item #${i + 1}: invalid end time`;
        return;
      }
      if (!it.title.trim()) {
        error = `Agenda item #${i + 1}: title is required`;
        return;
      }
    }

    loading = true;
    error = "";
    success = false;

    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("date", date);
    form.append("location", location);
    form.append("price", price);

    form.append("latitude", latitude);
    form.append("longitude", longitude);

    selectedCategories.forEach((id) => form.append("categories", id));

    if (agendaItems.length > 0) {
      // Бэкенд сам нормализует index и сортировку
      const payload = agendaItems.map((it, idx) => ({
        index: idx + 1,
        start: it.start,
        end: it.end?.trim() ? it.end : undefined,
        title: it.title.trim(),
        description: it.description?.trim() ? it.description.trim() : undefined,
      }));
      form.append("agenda", JSON.stringify(payload));
    }

    if (photo) form.append("photo", photo);
    if (documentFile) form.append("document", documentFile);

    const res = await fetch("/api/add-event", { method: "POST", body: form });
    loading = false;

    if (res.ok) {
      success = true;
      const data = await res.json();
      setTimeout(() => goto(`/events/${data.event.id}`), 700);
    } else {
      error = "Error creating event";
    }
  };
</script>

<section class="wrap">
  <h1>Create Event 🗓️</h1>

  <div class="grid">
    <div class="field">
      <label>Title *</label>
      <input type="text" bind:value={title} />
    </div>

    <div class="field">
      <label>Description *</label>
      <textarea bind:value={description} rows="4"></textarea>
    </div>

    <div class="field">
      <label>Date *</label>
      <input type="datetime-local" bind:value={date} />
    </div>

    <div class="field">
      <label>Location *</label>
      <input
        type="text"
        bind:value={location}
        placeholder="Click map to set location"
      />
    </div>

    <div class="field">
      <label>Pick location on map</label>
      <button class="btn" type="button" on:click={toggleMap}>
        {isMapVisible ? "Hide map" : "Pick on map"}
      </button>

      {#if isMapVisible}
        <div bind:this={mapContainer} class="map"></div>
        {#if latitude && longitude}
          <div class="muted">📍 {latitude}, {longitude}</div>
        {/if}
      {/if}
    </div>

    <div class="field" style="position:relative;">
      <label>Categories *</label>

      <div class="dropdown">
        <button
          class="select"
          type="button"
          on:click|stopPropagation={toggleDropdown}
        >
          <span class="ellipsis">
            {#if selectedCategories.length > 0}
              {selectedCategories
                .map((id) => categories.find((c) => c.id === id)?.name)
                .filter(Boolean)
                .join(", ")}
            {:else}
              Select categories...
            {/if}
          </span>
          <span>{dropdownOpen ? "▲" : "▼"}</span>
        </button>

        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        {#if dropdownOpen}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div class="menu" on:click|stopPropagation>
            <div class="menuTop">
              <input
                class="search"
                type="text"
                placeholder="Search category..."
                bind:value={categoryQuery}
              />

              <div class="limitHint">
                {selectedCategories.length}/{MAX_CATEGORIES}
              </div>
            </div>

            <div class="menuList">
              {#if filteredCategories.length === 0}
                <div class="empty">No results</div>
              {:else}
                {#each filteredCategories as cat}
                  {@const checked = selectedCategories.includes(cat.id)}
                  {@const disabled =
                    !checked && selectedCategories.length >= MAX_CATEGORIES}

                  <label class="menuRow {disabled ? 'disabled' : ''}">
                    <span class="name">{cat.name}</span>

                    <input
                      type="checkbox"
                      {checked}
                      {disabled}
                      on:change={() => toggleCategory(cat.id)}
                    />
                  </label>
                {/each}
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>

    <div class="field">
      <label>Price (€)</label>
      <input type="number" step="0.01" bind:value={price} />
    </div>

    <div class="field">
      <label>Photo</label>
      <input type="file" accept="image/*" on:change={handlePhotoUpload} />
      {#if photoPreview}
        <img src={photoPreview} alt="Preview" class="preview" />
      {/if}
    </div>

    <div class="field">
      <label>Document</label>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        on:change={handleDocumentUpload}
      />
      {#if documentFile}
        <div class="muted">📄 {documentFile.name}</div>
      {/if}
    </div>

    <!-- Agenda -->
    <div class="field">
      <div class="agendaHead">
        <label>Agenda</label>
        <button class="btn small" type="button" on:click={addAgendaItem}
          >+ Add item</button
        >
      </div>

      {#if agendaItems.length === 0}
        <div class="muted">No agenda items yet.</div>
      {:else}
        <div class="agenda">
          {#each agendaItems as it, i}
            <div class="agendaItem">
              <button
                class="iconBtn"
                type="button"
                aria-label="Remove agenda item"
                on:click={() => removeAgendaItem(i)}
                title="Remove"
              >
                ✕
              </button>

              <div class="agendaTime">
                <input
                  type="time"
                  value={it.start}
                  on:input={(e) =>
                    updateAgendaItem(i, {
                      start: (e.target as HTMLInputElement).value,
                    })}
                />
                <span class="dash">—</span>
                <input
                  type="time"
                  value={it.end ?? ""}
                  on:input={(e) =>
                    updateAgendaItem(i, {
                      end: (e.target as HTMLInputElement).value || undefined,
                    })}
                />
              </div>

              <input
                type="text"
                placeholder="Title *"
                value={it.title}
                on:input={(e) =>
                  updateAgendaItem(i, {
                    title: (e.target as HTMLInputElement).value,
                  })}
              />

              <textarea
                rows="2"
                placeholder="Description"
                value={it.description ?? ""}
                on:input={(e) =>
                  updateAgendaItem(i, {
                    description: (e.target as HTMLTextAreaElement).value,
                  })}
              />
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <button on:click={handleSubmit} class="btn primary" disabled={loading}>
      {loading ? "Creating..." : "Create Event"}
    </button>

    {#if success}
      <p class="ok">Event created!</p>
    {/if}
    {#if error}
      <p class="bad">{error}</p>
    {/if}
  </div>
</section>

<style>
  .wrap {
    max-width: 720px;
    margin: 24px auto;
    padding: 20px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
  }

  h1 {
    margin: 0 0 14px;
    color: #111827;
  }

  .grid {
    display: grid;
    gap: 14px;
  }

  .field label {
    display: block;
    font-weight: 600;
    margin-bottom: 6px;
    color: #374151;
  }

  input,
  textarea {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 14px;
    outline: none;
  }
  input:focus,
  textarea:focus {
    border-color: #60a5fa;
  }

  .btn {
    border: 1px solid #d1d5db;
    background: #f9fafb;
    border-radius: 999px;
    padding: 8px 12px;
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
  .btn.danger {
    background: #fff;
    border-color: #fecaca;
    color: #b91c1c;
  }
  .btn.danger:hover {
    background: #fef2f2;
  }

  .muted {
    color: #6b7280;
    font-size: 13px;
    margin-top: 6px;
  }

  .map {
    width: 100%;
    height: 260px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    margin-top: 8px;
  }

  .preview {
    margin-top: 10px;
    width: 180px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  /* Dropdown */
  .select {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    padding: 10px 12px;
    background: #f9fafb;
    cursor: pointer;
  }
  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    width: 100%;
    z-index: 50;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 10px;
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);
  }

  .menuTop {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .search {
    flex: 1;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 14px;
    outline: none;
    background: #f9fafb;
  }

  .search:focus {
    border-color: #60a5fa;
    background: #fff;
  }

  .limitHint {
    font-size: 12px;
    color: #6b7280;
    white-space: nowrap;
    padding: 6px 10px;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    background: #fff;
  }

  .menuList {
    max-height: 260px;
    overflow: auto;
    padding-right: 4px;
  }

  .menuRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 8px;
    border-radius: 10px;
    cursor: pointer;
  }

  .menuRow:hover {
    background: #f3f4f6;
  }

  .menuRow input[type="checkbox"] {
    width: 18px !important;
    height: 18px !important;
    flex: 0 0 auto;
    accent-color: #1e3a8a;
    cursor: pointer;
  }

  .menuRow.disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .menuRow.disabled:hover {
    background: transparent;
  }

  .name {
    flex: 1;
    color: #111827;
  }

  .empty {
    padding: 10px 6px;
    color: #6b7280;
    font-size: 14px;
  }

  /* Agenda */
  .agenda {
    display: grid;
    gap: 10px;
    margin-top: 10px;
  }
  .agendaItem {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 10px;
    display: grid;
    gap: 10px;
  }
  .time {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .time input {
    width: 140px;
  }
  /* small button */
  .btn.small {
    padding: 6px 10px;
    font-size: 13px;
  }

  /* Agenda */
  .agendaHead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 6px;
  }

  .agenda {
    display: grid;
    gap: 10px;
    margin-top: 8px;
  }

  .agendaItem {
    position: relative;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 12px;
    display: grid;
    gap: 10px;
    background: #fff;
  }

  .agendaTime {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .agendaTime input[type="time"] {
    width: 140px;
  }

  .dash {
    color: #6b7280;
  }

  /* маленькая кнопка удаления (крестик) */
  .iconBtn {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 28px;
    height: 28px;
    border-radius: 999px;
    border: 1px solid #e5e7eb;
    background: #fff;
    cursor: pointer;
    line-height: 1;
  }

  .iconBtn:hover {
    background: #fef2f2;
    border-color: #fecaca;
  }

  .ok {
    color: #16a34a;
    font-weight: 600;
  }
  .bad {
    color: #dc2626;
    font-weight: 600;
  }
</style>
