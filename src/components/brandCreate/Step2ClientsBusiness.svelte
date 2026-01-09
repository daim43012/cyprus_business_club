<script lang="ts">
  type BrandTagType =
    | "AUDIENCE"
    | "PAIN"
    | "SOLUTION"
    | "MONETIZATION"
    | "CLIENT";
  type BrandTag = { id: string; type: BrandTagType; title: string };

  export let description: string;
  export let products: string[];

  export let gender: string[];
  export let ageFrom: number | null;
  export let ageTo: number | null;
  export let ageAny: boolean = false;

  export let geo: string[];
  export let interests: string[];

  export let tagsByType: Record<BrandTagType, BrandTag[]>;
  export let loadingTags: boolean;
  export let selectedTagIds: string[];

  export let toggleTagId: (id: string) => Promise<void>;
  export let toggleGender: (val: string) => void;

  const OTHER_TYPES: BrandTagType[] = [
    "PAIN",
    "SOLUTION",
    "CLIENT",
    "MONETIZATION",
  ];

  // dropdown open state
  let tagOpen: Record<BrandTagType, boolean> = {
    AUDIENCE: false,
    PAIN: false,
    SOLUTION: false,
    MONETIZATION: false,
    CLIENT: false,
  };

  // ✅ one reactive search object
  let searchByType: Record<BrandTagType, string> = {
    AUDIENCE: "",
    PAIN: "",
    SOLUTION: "",
    CLIENT: "",
    MONETIZATION: "",
  };

  function openTagDropdown(type: BrandTagType) {
    tagOpen = {
      AUDIENCE: false,
      PAIN: false,
      SOLUTION: false,
      CLIENT: false,
      MONETIZATION: false,
      [type]: !tagOpen[type],
    } as any;
  }

  function setSearch(type: BrandTagType, value: string) {
    // ✅ reassign object -> guaranteed reactivity
    searchByType = { ...searchByType, [type]: value ?? "" };
  }

  // ✅ reactive filtered lists by type (stable search)
  let filteredByType: Record<BrandTagType, BrandTag[]> = {
    AUDIENCE: [],
    PAIN: [],
    SOLUTION: [],
    CLIENT: [],
    MONETIZATION: [],
  };

  function filterList(type: BrandTagType) {
    const q = (searchByType[type] || "").trim().toLowerCase();
    const list = tagsByType?.[type] || [];
    if (!q) return list;
    return list.filter((t) => (t.title || "").toLowerCase().includes(q));
  }

  $: filteredByType = {
    AUDIENCE: filterList("AUDIENCE"),
    PAIN: filterList("PAIN"),
    SOLUTION: filterList("SOLUTION"),
    CLIENT: filterList("CLIENT"),
    MONETIZATION: filterList("MONETIZATION"),
  };

  // ✅ reactive selected by type (instant chips)
  let selectedByType: Record<BrandTagType, BrandTag[]> = {
    AUDIENCE: [],
    PAIN: [],
    SOLUTION: [],
    CLIENT: [],
    MONETIZATION: [],
  };

  let selectedTitlesByType: Record<BrandTagType, string> = {
    AUDIENCE: "",
    PAIN: "",
    SOLUTION: "",
    CLIENT: "",
    MONETIZATION: "",
  };

  $: selectedByType = {
    AUDIENCE: (tagsByType?.AUDIENCE || []).filter((t) =>
      selectedTagIds.includes(t.id)
    ),
    PAIN: (tagsByType?.PAIN || []).filter((t) => selectedTagIds.includes(t.id)),
    SOLUTION: (tagsByType?.SOLUTION || []).filter((t) =>
      selectedTagIds.includes(t.id)
    ),
    CLIENT: (tagsByType?.CLIENT || []).filter((t) =>
      selectedTagIds.includes(t.id)
    ),
    MONETIZATION: (tagsByType?.MONETIZATION || []).filter((t) =>
      selectedTagIds.includes(t.id)
    ),
  };

  $: selectedTitlesByType = {
    AUDIENCE: selectedByType.AUDIENCE.map((t) => t.title).join(", "),
    PAIN: selectedByType.PAIN.map((t) => t.title).join(", "),
    SOLUTION: selectedByType.SOLUTION.map((t) => t.title).join(", "),
    CLIENT: selectedByType.CLIENT.map((t) => t.title).join(", "),
    MONETIZATION: selectedByType.MONETIZATION.map((t) => t.title).join(", "),
  };

  // dynamic fields
  function addProductField() {
    products = [...products, ""];
  }
  function removeProductField(i: number) {
    if (products.length > 1) products = products.filter((_, idx) => idx !== i);
  }

  function addGeoField() {
    geo = [...geo, ""];
  }
  function removeGeoField(i: number) {
    if (geo.length > 1) geo = geo.filter((_, idx) => idx !== i);
  }

  function addInterestField() {
    interests = [...interests, ""];
  }
  function removeInterestField(i: number) {
    if (interests.length > 1)
      interests = interests.filter((_, idx) => idx !== i);
  }

  async function onToggleTag(id: string) {
    await toggleTagId(id);
  }
</script>

<section class="card">
  <h2>About</h2>

  <label>
    What does the brand do?
    <textarea
      bind:value={description}
      rows="3"
      placeholder="Short description..."
    />
  </label>

  <h3>Products / services</h3>
  <div class="dynamic">
    {#each products as p, i}
      <div class="row-field">
        <input bind:value={products[i]} placeholder="e.g. AI assistant" />
        {#if products.length > 1}
          <button
            type="button"
            class="remove"
            on:click={() => removeProductField(i)}>🗑</button
          >
        {/if}
      </div>
    {/each}
    <button type="button" class="add" on:click={addProductField}>+ Add</button>
  </div>
</section>

<section class="card">
  <h2>Target audience</h2>

  <div class="row">
    <div>
      Audience gender
      <div class="chips">
        {#each ["Male", "Female", "All"] as g}
          <button
            type="button"
            class:active={gender.includes(g)}
            on:click={() => toggleGender(g)}
          >
            {g}
          </button>
        {/each}
      </div>
    </div>

    <div class="age">
      <div class="age-header">
        <span>Age</span>
        <label class="age-any">
          <input type="checkbox" bind:checked={ageAny} />
          <span>Any age</span>
        </label>
      </div>

      {#if !ageAny}
        <div class="age-inputs">
          <input type="number" bind:value={ageFrom} placeholder="from" />
          <input type="number" bind:value={ageTo} placeholder="to" />
        </div>
      {:else}
        <div class="muted small">Any age range is OK</div>
      {/if}
    </div>
  </div>

  <h3>Geography</h3>
  <div class="dynamic">
    {#each geo as g, i}
      <div class="row-field">
        <input bind:value={geo[i]} placeholder="e.g. Cyprus" />
        {#if geo.length > 1}
          <button
            type="button"
            class="remove"
            on:click={() => removeGeoField(i)}>🗑</button
          >
        {/if}
      </div>
    {/each}
    <button type="button" class="add" on:click={addGeoField}>+ Add</button>
  </div>

  <h3>Interests</h3>
  <div class="dynamic">
    {#each interests as it, i}
      <div class="row-field">
        <input bind:value={interests[i]} placeholder="e.g. fintech" />
        {#if interests.length > 1}
          <button
            type="button"
            class="remove"
            on:click={() => removeInterestField(i)}>🗑</button
          >
        {/if}
      </div>
    {/each}
    <button type="button" class="add" on:click={addInterestField}>+ Add</button>
  </div>

  <h3>Audience segments (from database)</h3>

  {#if loadingTags}
    <div class="muted">Loading suggestions...</div>
  {:else}
    <div class="dropdown">
      <button
        type="button"
        class="dropdown-btn"
        on:click={() => openTagDropdown("AUDIENCE")}
      >
        {#if selectedByType.AUDIENCE.length}
          {selectedTitlesByType.AUDIENCE}
        {:else}
          Select segments
        {/if}
        <span class="chev">{tagOpen.AUDIENCE ? "▲" : "▼"}</span>
      </button>

      {#if selectedByType.AUDIENCE.length}
        <div class="selected-chips">
          {#each selectedByType.AUDIENCE as t (t.id)}
            <button
              type="button"
              class="chip"
              on:click={() => onToggleTag(t.id)}
              title="Remove"
            >
              {t.title}<span class="x">×</span>
            </button>
          {/each}
        </div>
      {/if}

      {#if tagOpen.AUDIENCE}
        <div class="dropdown-menu">
          <input
            class="search"
            placeholder="Search..."
            value={searchByType.AUDIENCE}
            on:input={(e) =>
              setSearch(
                "AUDIENCE",
                (e.currentTarget as HTMLInputElement).value
              )}
          />
          <div class="menu-list">
            {#each filteredByType.AUDIENCE as t (t.id)}
              <label class="menu-item">
                <input
                  type="checkbox"
                  checked={selectedTagIds.includes(t.id)}
                  on:change={() => onToggleTag(t.id)}
                />
                <span>{t.title}</span>
              </label>
            {/each}
            {#if filteredByType.AUDIENCE.length === 0}
              <div class="muted">Nothing found</div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</section>

<section class="card">
  <h2>Problems / solutions / clients / monetization</h2>

  {#if loadingTags}
    <div class="muted">Loading suggestions...</div>
  {:else}
    {#each OTHER_TYPES as type}
      <h3>
        {#if type === "PAIN"}Problems (pains){/if}
        {#if type === "SOLUTION"}Solutions{/if}
        {#if type === "CLIENT"}Potential clients{/if}
        {#if type === "MONETIZATION"}Monetization{/if}
      </h3>

      <div class="dropdown">
        <button
          type="button"
          class="dropdown-btn"
          on:click={() => openTagDropdown(type)}
        >
          {#if selectedByType[type].length}
            {selectedTitlesByType[type]}
          {:else}
            Select {type.toLowerCase()}
          {/if}
          <span class="chev">{tagOpen[type] ? "▲" : "▼"}</span>
        </button>

        {#if selectedByType[type].length}
          <div class="selected-chips">
            {#each selectedByType[type] as t (t.id)}
              <button
                type="button"
                class="chip"
                on:click={() => onToggleTag(t.id)}
                title="Remove"
              >
                {t.title}<span class="x">×</span>
              </button>
            {/each}
          </div>
        {/if}

        {#if tagOpen[type]}
          <div class="dropdown-menu">
            <div class="menu-list">
              {#each filteredByType[type] as t (t.id)}
                <label class="menu-item">
                  <input
                    type="checkbox"
                    checked={selectedTagIds.includes(t.id)}
                    on:change={() => onToggleTag(t.id)}
                  />
                  <span>{t.title}</span>
                </label>
              {/each}
              {#if filteredByType[type].length === 0}
                <div class="muted">Nothing found</div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</section>

<style>
  .selected-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  }

  .chip {
    background: #eff6ff;
    border: 1px solid rgba(37, 99, 235, 0.25);
    color: #1d4ed8;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .chip:hover {
    background: #dbeafe;
  }

  .chip .x {
    font-size: 14px;
    line-height: 1;
    opacity: 0.8;
  }

  .card {
    background: #fff;
    border-radius: 1rem;
    padding: 2rem;
    width: 100%;
    max-width: 1100px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(15, 23, 42, 0.05);
    color: #0b3954;
    transition:
      box-shadow 0.25s ease,
      transform 0.15s ease;
    position: relative;
    display: grid;
    gap: 14px;
  }

  .card:hover {
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
  }

  .card h2,
  .card h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 4px;
    color: #0b3954;
  }

  .card h3 {
    margin-top: 10px;
  }

  label {
    display: grid;
    gap: 6px;
    font-size: 14px;
    color: #111827;
    font-weight: 500;
  }

  input,
  textarea {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    color: #0f172a;
    padding: 10px 12px;
    border-radius: 0.7rem;
    outline: none;
    font-size: 14px;
    font-weight: 400;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease,
      background 0.15s ease;
  }

  input::placeholder,
  textarea::placeholder {
    color: #9ca3af;
    font-weight: 400;
  }

  input:focus,
  textarea:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.35);
    background: #ffffff;
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }

  .muted {
    color: #6b7280;
    font-size: 14px;
    font-weight: 400;
  }

  .muted.small {
    font-size: 12px;
  }

  .row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    align-items: flex-start;
  }

  button {
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    border-radius: 0.75rem;
    border: 1px solid transparent;
    padding: 8px 14px;
    cursor: pointer;
    background: #2563eb;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition:
      background 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.12s ease,
      border-color 0.2s ease;
  }

  button:hover {
    background: #1d4ed8;
    box-shadow: 0 3px 10px rgba(37, 99, 235, 0.25);
    transform: translateY(-0.5px);
  }

  button:active {
    transform: translateY(0);
    box-shadow: none;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }

  .add {
    background: #ffffff;
    color: #2563eb;
    border-color: rgba(37, 99, 235, 0.35);
  }

  .add:hover {
    background: #eff6ff;
  }

  .remove {
    background: #fee2e2;
    color: #b91c1c;
    border-color: #fecaca;
    padding-inline: 10px;
  }

  .remove:hover {
    background: #fecaca;
  }

  .chips {
    display: flex;
    gap: 8px;
    margin-top: 6px;
    flex-wrap: wrap;
  }

  .chips button {
    background: #f9fafb;
    border-color: #e5e7eb;
    color: #374151;
    font-weight: 500;
    padding-inline: 10px;
  }

  .chips button:hover {
    background: #eff6ff;
    border-color: #bfdbfe;
  }

  .chips button.active {
    background: #2563eb;
    border-color: #2563eb;
    color: #ffffff;
  }

  .age {
    min-width: 200px;
  }

  .age-inputs {
    display: flex;
    gap: 8px;
  }

  .age-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .age-any {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #6b7280;
    font-weight: 400;
  }

  .age-any input {
    width: auto;
    padding: 0;
  }

  .dynamic {
    display: grid;
    gap: 10px;
    margin-bottom: 4px;
  }

  .row-field {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .row-field input {
    flex: 1;
  }

  .dropdown {
    position: relative;
  }

  .dropdown-btn {
    width: 100%;
    justify-content: space-between;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    color: #111827;
    padding: 10px 12px;
    border-radius: 0.7rem;
    font-weight: 400;
  }

  .dropdown-btn:hover {
    background: #ffffff;
    border-color: #cbd5f5;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
  }

  .chev {
    opacity: 0.7;
    font-size: 12px;
  }

  .dropdown-menu {
    position: absolute;
    z-index: 9999;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 0.9rem;
    padding: 8px;
    display: grid;
    gap: 8px;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.15);
  }

  .search {
    width: 100%;
    font-weight: 400;
  }

  .menu-list {
    max-height: 220px;
    overflow: auto;
    display: grid;
    gap: 6px;
    padding-right: 4px;
  }

  .menu-item {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 14px;
    padding: 6px;
    border-radius: 0.6rem;
    color: #111827;
    font-weight: 400;
  }

  .menu-item:hover {
    background: #f3f4f6;
  }

  .menu-item input[type="checkbox"] {
    width: 14px;
    height: 14px;
    accent-color: #2563eb;
  }

  @media (max-width: 768px) {
    .card {
      padding: 1.4rem;
    }
  }
</style>
