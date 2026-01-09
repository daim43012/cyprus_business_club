<script lang="ts">
  import { onMount } from "svelte";
  import MemberCard from "./MemberCard.svelte";

  export let data: any;

  let search = "";

  $: members = data?.members ?? [];
  $: recommendedRaw = data?.recommendedMembers ?? [];
  $: hasRecommended = recommendedRaw.length > 0;

  $: recommended = recommendedRaw.slice(0, 6);

  $: recommendedIds = new Set(recommended.map((m: any) => m.id));
  $: allMembersBase = hasRecommended
    ? members.filter((m: any) => !recommendedIds.has(m.id))
    : members;

  const matches = (m: any) =>
    (m.info?.name ?? "Без имени").toLowerCase().includes(search.toLowerCase());

  $: filteredRecommended = recommended.filter(matches);
  $: filteredMembers = allMembersBase.filter(matches);

  let isLoggedIn = true;
  let followMap: Record<string, boolean> = {};
  let followLoading: Record<string, boolean> = {};

  function stopCardClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function currentVisibleIds() {
    const ids = [...filteredRecommended, ...filteredMembers].map(
      (u: any) => u.id
    );
    return [...new Set(ids)];
  }

  async function loadFollowStatusFor(userId: string) {
    try {
      const res = await fetch(
        `/api/member/follow?userId=${encodeURIComponent(userId)}`
      );

      if (res.status === 401) {
        isLoggedIn = false;
        return;
      }

      if (!res.ok) return;

      const j = await res.json();
      followMap = { ...followMap, [userId]: !!j.following };
    } catch {
      // ignore
    }
  }

  async function loadFollowStatuses(ids: string[]) {
    if (!isLoggedIn) return;

    const missing = ids.filter((id) => followMap[id] === undefined);
    if (missing.length === 0) return;

    await Promise.all(missing.map((id) => loadFollowStatusFor(id)));
  }

  onMount(async () => {
    await loadFollowStatuses(currentVisibleIds());
  });

  $: loadFollowStatuses(currentVisibleIds());

  async function toggleFollow(userId: string) {
    if (!isLoggedIn) return;

    const currentlyFollowing = !!followMap[userId];
    followLoading = { ...followLoading, [userId]: true };

    try {
      const res = await fetch("/api/member/follow", {
        method: currentlyFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.status === 401) {
        isLoggedIn = false;
        return;
      }

      if (!res.ok) return;

      followMap = { ...followMap, [userId]: !currentlyFollowing };
    } finally {
      followLoading = { ...followLoading, [userId]: false };
    }
  }
</script>

<section class="members-section">
  <div class="members-header">
    <h1>{hasRecommended ? "Recommended for you" : "Members"}</h1>

    <input
      type="text"
      placeholder="Поиск по имени..."
      bind:value={search}
      class="search-input"
    />
  </div>

  {#if hasRecommended}
    {#if filteredRecommended.length === 0}
      <p class="empty">В рекомендациях ничего не найдено</p>
    {:else}
      <div class="members-grid">
        {#each filteredRecommended as member (member.id)}
          <MemberCard
            {member}
            {isLoggedIn}
            isFollowing={!!followMap[member.id]}
            isLoading={!!followLoading[member.id]}
            onToggle={toggleFollow}
            {stopCardClick}
          >
            <div slot="hover" class="hover-pop">
              <div class="hover-top">
                <div class="hover-title">
                  {member.info?.name ?? "Без имени"}
                </div>
                <span class="badge">{member.info?.status ?? "Member"}</span>
              </div>

              {#if member.info?.bio}
                <div class="hover-bio">{member.info.bio}</div>
              {/if}

              <div class="hover-stats">
                <div class="stat">
                  <div class="stat-num">{member._count?.followers ?? 0}</div>
                  <div class="stat-label">Followers</div>
                </div>
                <div class="stat">
                  <div class="stat-num">{member._count?.following ?? 0}</div>
                  <div class="stat-label">Following</div>
                </div>
              </div>

              {#if member.info?.location}
                <div class="hover-row">
                  <span class="hover-label">Location</span>
                  <span class="hover-value">{member.info.location}</span>
                </div>
              {/if}

              <div class="hover-cta">Open Profile →</div>
            </div>
          </MemberCard>
        {/each}
      </div>
    {/if}

    <hr class="divider" />

    <div class="members-header">
      <h1>All members</h1>
      <div></div>
    </div>
  {/if}

  {#if filteredMembers.length === 0}
    <p class="empty">Ничего не найдено</p>
  {:else}
    <div class="members-grid">
      {#each filteredMembers as member (member.id)}
        <MemberCard
          {member}
          {isLoggedIn}
          isFollowing={!!followMap[member.id]}
          isLoading={!!followLoading[member.id]}
          onToggle={toggleFollow}
          {stopCardClick}
        >
          <div slot="hover" class="hover-pop">
            <div class="hover-top">
              <div class="hover-title">{member.info?.name ?? "Без имени"}</div>
              <span class="badge">{member.info?.status ?? "Member"}</span>
            </div>

            {#if member.info?.bio}
              <div class="hover-bio">{member.info.bio}</div>
            {/if}

            <div class="hover-stats">
              <div class="stat">
                <div class="stat-num">{member._count?.followers ?? 0}</div>
                <div class="stat-label">Followers</div>
              </div>
              <div class="stat">
                <div class="stat-num">{member._count?.following ?? 0}</div>
                <div class="stat-label">Following</div>
              </div>
            </div>

            {#if member.info?.location}
              <div class="hover-row">
                <span class="hover-label">Location</span>
                <span class="hover-value">{member.info.location}</span>
              </div>
            {/if}

            <div class="hover-cta">Open Profile →</div>
          </div>
        </MemberCard>
      {/each}
    </div>
  {/if}
</section>

<style>
  .divider {
    margin: 18px 0;
    border: none;
    border-top: 1px solid #e5e7eb;
  }

  .members-section {
    padding: 3rem 0 2rem;
  }

  .members-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1050px;
    margin: 0 auto 1.2rem;
    padding: 0 1.25rem;
    gap: 1rem;
  }

  h1 {
    font-size: clamp(1.5rem, 2.2vw, 2rem);
    font-weight: 800;
    color: #0b3954;
    margin: 0;
    letter-spacing: -0.02em;
  }

  .search-input {
    padding: 0.65rem 1rem;
    border-radius: 0.8rem;
    border: 1px solid #cbd5e1;
    font-size: 0.98rem;
    width: min(320px, 100%);
    transition: all 0.2s ease;
    background: #fff;
  }

  .search-input:focus {
    border-color: #2563eb;
    outline: none;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
  }

  .members-grid {
    max-width: 1050px;
    margin: 0 auto;
    padding: 0 1.25rem;
    display: grid;
    gap: 0.9rem;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 900px) {
    .members-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    .members-grid {
      grid-template-columns: 1fr;
    }
    .members-header {
      flex-direction: column;
      align-items: stretch;
    }
  }

  .empty {
    max-width: 1050px;
    margin: 0 auto;
    padding: 0 1.25rem;
    color: rgba(11, 57, 84, 0.75);
  }

  /* ===== Hover pop (твои стили, перенёс как есть) ===== */
  .hover-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.35rem;
  }

  .hover-bio {
    margin: 0.4rem 0 0.55rem;
    color: rgba(11, 57, 84, 0.85);
    font-size: 0.9rem;
    line-height: 1.25rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .hover-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin: 0.2rem 0 0.55rem;
  }

  .stat {
    border: 1px solid #e6edf5;
    border-radius: 0.85rem;
    padding: 0.55rem 0.6rem;
    background: #f8fafc;
  }

  .stat-num {
    font-weight: 900;
    color: #0b3954;
    line-height: 1;
  }

  .stat-label {
    margin-top: 0.15rem;
    font-size: 0.78rem;
    color: rgba(11, 57, 84, 0.6);
  }

  .hover-pop {
    position: absolute;
    left: 1rem;
    right: 1rem;
    top: calc(100% + 10px);

    background: rgba(255, 255, 255, 0.98);
    color: #0b3954;
    border: 1px solid rgba(148, 163, 184, 0.25);
    border-radius: 1rem;
    padding: 0.85rem 0.9rem;

    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
    opacity: 0;
    transform: translateY(-6px);
    pointer-events: none;
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
    z-index: 20;
  }

  /* MemberCard — это <a>, поэтому target внутри компонента */
  :global(.member-card:hover .hover-pop) {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .hover-pop::before {
    content: "";
    position: absolute;
    top: -7px;
    left: 22px;
    width: 14px;
    height: 14px;
    background: rgba(255, 255, 255, 0.95);
    transform: rotate(45deg);
    border-left: 1px solid rgba(148, 163, 184, 0.25);
    border-top: 1px solid rgba(148, 163, 184, 0.25);
  }

  .hover-title {
    font-weight: 800;
    font-size: 0.98rem;
    margin-bottom: 0.55rem;
  }

  .hover-row {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    font-size: 0.9rem;
    padding: 0.22rem 0;
    border-top: 1px dashed rgba(148, 163, 184, 0.22);
  }

  .hover-row:first-of-type {
    border-top: 0;
  }

  .hover-label {
    color: rgba(0, 0, 0, 0.7);
    flex-shrink: 0;
  }

  .hover-value {
    color: rgba(0, 0, 0, 0.95);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: right;
  }

  .hover-cta {
    margin-top: 0.55rem;
    font-size: 0.9rem;
    font-weight: 700;
    color: #000000;
  }
</style>
