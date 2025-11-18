<script lang="ts">
  import { onMount } from "svelte";

  interface Member {
    id: string;
    email: string;
    info?: {
      name?: string;
      photo?: string;
      status?: string;
    };
  }

  let members: Member[] = [];
  let filteredMembers: Member[] = [];
  let search = "";
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      const res = await fetch("/api/members");
      if (res.ok) {
        members = await res.json();
        filteredMembers = members;
      } else {
        error = "Не удалось загрузить участников.";
      }
    } catch (err) {
      console.error("Ошибка загрузки:", err);
      error = "Ошибка соединения с сервером.";
    } finally {
      loading = false;
    }
  });

  $: filteredMembers = members.filter((m) =>
    (m.info?.name || "Без имени").toLowerCase().includes(search.toLowerCase())
  );
</script>

<section class="members-section">
  <div class="members-header">
    <h1>All Events</h1>
    <input
      type="text"
      placeholder="Поиск по имени..."
      bind:value={search}
      class="search-input"
    />
  </div>

  {#if loading}
    <p class="loader">Загрузка...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if filteredMembers.length === 0}
    <p class="empty">Ничего не найдено</p>
  {:else}
    <section class="members-grid">
      {#each filteredMembers as member}
        <a href={`/members/${member.id}`} class="member-card">
          <img
            src={member.info?.photo ||
              "https://api.dicebear.com/7.x/initials/svg?seed=" +
                (member.info?.name || "User")}
            alt="Member photo"
            class="photo"
          />
          <h3>{member.info?.name || "Без имени"}</h3>
          <p class="status">{member.info?.status || "Member"}</p>
        </a>
      {/each}
    </section>
  {/if}
</section>

<style>
  .members-section {
    padding-top: 3rem;
  }

  .members-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1000px;
    margin: 0 auto 1.5rem;
    padding: 0 2rem;
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #0b3954;
    margin: 0;
  }

  .search-input {
    padding: 0.6rem 1rem;
    border-radius: 0.6rem;
    border: 1px solid #cbd5e1;
    font-size: 0.95rem;
    width: 230px;
    transition: all 0.2s ease;
  }

  .search-input:focus {
    border-color: #2563eb;
    outline: none;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  }

  .members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.2rem;
    padding: 2rem;
    max-width: 1000px;
    margin: 0 auto;
  }

  .member-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
    border-radius: 1rem;
    padding: 1rem;
    text-align: center;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.2s ease;
    text-decoration: none;
    color: inherit;
  }

  .member-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
  }

  .photo {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 0.6rem;
  }

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #0b3954;
    margin: 0.3rem 0;
  }

  .status {
    font-size: 0.9rem;
    color: #64748b;
  }

  .loader,
  .error,
  .empty {
    text-align: center;
    padding: 2rem;
    color: #475569;
  }

  .error {
    color: #ef4444;
  }
</style>
