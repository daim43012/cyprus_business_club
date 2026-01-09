<script lang="ts">
  import { onMount, tick } from "svelte";

  import Step1Basics from "./Step1Basics.svelte";
  import Step2ClientsBusiness from "./Step2ClientsBusiness.svelte";
  import Step3Team from "./Step3Team.svelte";
  import ContextAssistant from "../ContextAssistant.svelte";

  type Category = { id: string; name: string };
  type TeamMember = { name: string; role: string; email: string };

  type BrandTagType =
    | "AUDIENCE"
    | "PAIN"
    | "SOLUTION"
    | "MONETIZATION"
    | "CLIENT";
  type BrandTag = { id: string; type: BrandTagType; title: string };

  // -----------------------------
  // Data loading state
  // -----------------------------
  let categories: Category[] = [];
  let loadingCategories = true;

  let loadingTags = true;
  let tagsByType: Record<BrandTagType, BrandTag[]> = {
    AUDIENCE: [],
    PAIN: [],
    SOLUTION: [],
    MONETIZATION: [],
    CLIENT: [],
  };

  // -----------------------------
  // Form state
  // -----------------------------
  let selectedCategoryIds: string[] = [];
  let selectedCategoryNames: string[] = [];

  let selectedTagIds: string[] = [];

  // Brand fields
  let name = "";
  let website = "";
  let brandType: "PERSONAL" | "COMPANY" = "COMPANY";

  // logo
  let logoFile: File | null = null;
  let logoPreviewUrl: string | null = null;

  // answers
  let description = "";
  let products: string[] = [""];

  let gender: string[] = [];
  let ageFrom: number | null = null;
  let ageTo: number | null = null;
  let ageAny = true;

  let geo: string[] = [""];
  let interests: string[] = [""];

  // socials (✅ живут в Step1)
  let instagram = "";
  let telegram = "";
  let tiktok = "";
  let youtube = "";
  let linkedin = "";
  let contactEmail = "";
  let phone = "";

  let team: TeamMember[] = [];

  // UI state
  let step = 1;
  let submitting = false;
  let errorMsg: string | null = null;
  let successMsg: string | null = null;

  // -----------------------------
  // Helpers
  // -----------------------------
  async function safeJson(r: Response) {
    try {
      return await r.json();
    } catch {
      return null;
    }
  }

  function cleanArray(list: string[]) {
    return list.map((x) => x.trim()).filter((x) => x.length > 0);
  }

  async function toggleCategory(cat: Category) {
    if (selectedCategoryIds.includes(cat.id)) {
      selectedCategoryIds = selectedCategoryIds.filter((x) => x !== cat.id);
      selectedCategoryNames = selectedCategoryNames.filter(
        (x) => x !== cat.name
      );
    } else {
      selectedCategoryIds = [...selectedCategoryIds, cat.id];
      selectedCategoryNames = [...selectedCategoryNames, cat.name];
    }
    await tick();
  }

  async function toggleTagId(id: string) {
    if (selectedTagIds.includes(id)) {
      selectedTagIds = selectedTagIds.filter((x) => x !== id);
    } else {
      selectedTagIds = [...selectedTagIds, id];
    }
    await tick();
  }

  function selectedTitles(type: BrandTagType) {
    const list = tagsByType[type] || [];
    return list
      .filter((t) => selectedTagIds.includes(t.id))
      .map((t) => t.title);
  }

  function toggleGender(val: string) {
    if (gender.includes(val)) gender = gender.filter((g) => g !== val);
    else gender = [...gender, val];
  }

  function onLogoChange(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    logoFile = file;
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    logoPreviewUrl = URL.createObjectURL(file);
  }

  // ageAny logic
  $: if (ageAny) {
    ageFrom = null;
    ageTo = null;
  }

  function nextStep() {
    errorMsg = null;
    if (step < 3) {
      step += 1;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  function prevStep() {
    errorMsg = null;
    if (step > 1) {
      step -= 1;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // -----------------------------
  // Load data
  // -----------------------------
  async function loadCategories() {
    loadingCategories = true;
    try {
      const r = await fetch("/api/categories");
      if (!r.ok) throw new Error("Failed to load categories");
      categories = await r.json();
    } catch (e: any) {
      errorMsg = e.message || "Error loading categories";
    } finally {
      loadingCategories = false;
    }
  }

  async function loadTags() {
    loadingTags = true;
    try {
      const types: BrandTagType[] = [
        "AUDIENCE",
        "PAIN",
        "SOLUTION",
        "CLIENT",
        "MONETIZATION",
      ];
      const rs = await Promise.all(
        types.map((t) => fetch(`/api/brands/tags?type=${t}`))
      );

      for (let i = 0; i < rs.length; i++) {
        const r = rs[i];
        const type = types[i];
        if (!r.ok) {
          const data = await safeJson(r);
          throw new Error(data?.error || `Failed to load ${type} tags`);
        }
        const data = (await r.json()) as BrandTag[];
        tagsByType = { ...tagsByType, [type]: data };
      }
    } catch (e: any) {
      errorMsg = e.message || "Error loading tags";
    } finally {
      loadingTags = false;
    }
  }

  onMount(async () => {
    await loadCategories();
    await loadTags();
  });

  // -----------------------------
  // Submit
  // -----------------------------
  async function submit() {
    errorMsg = null;
    successMsg = null;

    if (!name.trim()) {
      errorMsg = "Brand name is required.";
      step = 1;
      return;
    }

    if (selectedCategoryIds.length === 0) {
      errorMsg = "Please select at least one category (your activity area).";
      step = 1;
      return;
    }

    submitting = true;

    try {
      const answers = {
        about: {
          description: description.trim() || null,
          sphere: null,
          products: cleanArray(products),
        },
        audience: {
          gender,
          ageRange: {
            from: ageAny ? null : (ageFrom ?? null),
            to: ageAny ? null : (ageTo ?? null),
          },
          geo: cleanArray(geo),
          interests: cleanArray(interests),
          segments: selectedTitles("AUDIENCE"),
        },
        problems: {
          pains: selectedTitles("PAIN"),
          solutions: selectedTitles("SOLUTION"),
        },
        clients: {
          potential: selectedTitles("CLIENT"),
        },
        monetization: {
          models: selectedTitles("MONETIZATION"),
          notes: null,
        },
        links: {
          website: website.trim() || null,
          socials: {
            instagram: instagram.trim() || null,
            telegram: telegram.trim() || null,
            tiktok: tiktok.trim() || null,
            youtube: youtube.trim() || null,
            linkedin: linkedin.trim() || null,
          },
          contacts: {
            email: contactEmail.trim() || null,
            phone: phone.trim() || null,
          },
        },
        team: team
          .filter((m) => m.name.trim() || m.role.trim() || m.email.trim())
          .map((m) => ({
            name: m.name.trim() || null,
            role: m.role.trim() || null,
            email: m.email.trim() || null,
          })),
      };

      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("website", website.trim() || "");
      fd.append("type", brandType);
      fd.append("categoryIds", JSON.stringify(selectedCategoryIds));
      fd.append("answers", JSON.stringify(answers));
      fd.append("tagIds", JSON.stringify(selectedTagIds));
      if (logoFile) fd.append("logo", logoFile);

      const r = await fetch("/api/brands", { method: "POST", body: fd });
      const data = await safeJson(r);
      if (!r.ok) throw new Error(data?.error || "Failed to create brand");

      successMsg = "Brand created and sent for moderation.";

      // reset
      name = "";
      website = "";
      brandType = "COMPANY";

      description = "";
      products = [""];

      gender = [];
      ageAny = true;

      geo = [""];
      interests = [""];

      instagram = telegram = tiktok = youtube = linkedin = "";
      contactEmail = phone = "";

      selectedCategoryIds = [];
      selectedCategoryNames = [];

      selectedTagIds = [];

      logoFile = null;
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
      logoPreviewUrl = null;

      team = [];
      step = 1;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: any) {
      errorMsg = e.message || "Brand creation error";
    } finally {
      submitting = false;
    }
  }
</script>

<div class="wrap">
  <h1>Create brand</h1>

  <div class="steps-indicator">
    <span class:active={step === 1} on:click={() => (step = 1)}>1. Brand</span>
    <span class:active={step === 2} on:click={() => (step = 2)}
      >2. Clients & business</span
    >
    <span class:active={step === 3} on:click={() => (step = 3)}>3. Team</span>
  </div>

  {#if errorMsg}<div class="alert error">{errorMsg}</div>{/if}
  {#if successMsg}<div class="alert success">{successMsg}</div>{/if}

  {#if step === 1}
    <Step1Basics
      bind:name
      bind:website
      bind:brandType
      bind:logoFile
      bind:logoPreviewUrl
      {categories}
      {loadingCategories}
      bind:selectedCategoryIds
      bind:selectedCategoryNames
      bind:instagram
      bind:telegram
      bind:tiktok
      bind:youtube
      bind:linkedin
      bind:contactEmail
      bind:phone
      {onLogoChange}
      {toggleCategory}
    />
  {:else if step === 2}
    <Step2ClientsBusiness
      bind:description
      bind:products
      bind:gender
      bind:ageFrom
      bind:ageTo
      bind:ageAny
      bind:geo
      bind:interests
      {tagsByType}
      {loadingTags}
      bind:selectedTagIds
      {toggleTagId}
      {toggleGender}
    />
  {:else}
    <Step3Team bind:team />
  {/if}

  <div class="actions">
    {#if step > 1}
      <button type="button" class="secondary" on:click={prevStep}>Back</button>
    {/if}

    {#if step < 3}
      <button type="button" on:click={nextStep}>Next</button>
    {:else}
      <button type="button" disabled={submitting} on:click={submit}>
        {submitting ? "Creating..." : "Create brand"}
      </button>
    {/if}
  </div>
</div>
<ContextAssistant
  contextKey="brand_create"
  payload={""}
  title="Помощник по созданию бренда"
/>

<style>
  .wrap {
    max-width: 1100px;
    margin: 0 auto;
    padding: 32px 16px 40px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  h1 {
    font-size: 32px;
    font-weight: 600;
    margin: 0 0 4px;
    color: #0b3954;
  }

  .steps-indicator {
    display: inline-flex;
    gap: 8px;
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
  }

  .steps-indicator span {
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid transparent;
    cursor: pointer;
    background: transparent;
    transition:
      background 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease;
    font-weight: 500;
  }

  .steps-indicator span:hover {
    border-color: rgba(37, 99, 235, 0.3);
  }

  .steps-indicator span.active {
    border-color: #2563eb;
    color: #1d4ed8;
    background: rgba(37, 99, 235, 0.08);
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

  .secondary {
    background: #ffffff;
    color: #111827;
    border-color: #d1d5db;
  }

  .secondary:hover {
    background: #f3f4f6;
    box-shadow: 0 3px 10px rgba(15, 23, 42, 0.12);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 4px;
  }

  .alert {
    padding: 10px 12px;
    border-radius: 0.8rem;
    font-size: 14px;
    max-width: 1100px;
    font-weight: 400;
  }

  .alert.error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #b91c1c;
  }

  .alert.success {
    background: #ecfdf3;
    border: 1px solid #bbf7d0;
    color: #166534;
  }

  @media (max-width: 768px) {
    .wrap {
      padding-inline: 12px;
    }
  }
</style>
