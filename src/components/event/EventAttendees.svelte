<script lang="ts">
  import { photoSrc } from "$lib/utils/photo";

  export let data: any;

  let attendees: any[] = data.attendees || [];
  let showAll = false;

  const MAX_VISIBLE = 12;

  function getName(user: any) {
    return user?.info?.name || user?.email || "User";
  }

  function getAvatar(user: any) {
    const resolved = photoSrc(user?.info?.photo);
    if (resolved) return resolved;

    const seed = encodeURIComponent(getName(user));
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`;
  }

  $: visible = showAll ? attendees : attendees.slice(0, MAX_VISIBLE);
  $: hiddenCount = Math.max(0, attendees.length - visible.length);
</script>

<div class="attendees-block">
  <div class="head">
    <h2>Участники <span class="count">({attendees.length})</span></h2>

    {#if attendees.length > MAX_VISIBLE}
      <button class="toggle" type="button" on:click={() => (showAll = !showAll)}>
        {showAll ? "Hide" : "Show all"}
      </button>
    {/if}
  </div>

  {#if attendees.length === 0}
    <div class="empty">Пока никто не зарегистрировался. Будь первым 🙂</div>
  {:else}
    <div class="avatars">
      {#each visible as user (user.id)}
        <a
          href={`/members/${user.id}`}
          class="avatar-link"
          title={getName(user)}
          aria-label={getName(user)}
        >
          <img
            src={getAvatar(user)}
            alt={getName(user)}
            class="avatar-img"
            loading="lazy"
            referrerpolicy="no-referrer"
          />
        </a>
      {/each}

      {#if !showAll && hiddenCount > 0}
        <button
          class="more"
          type="button"
          on:click={() => (showAll = true)}
          aria-label={`Show ${hiddenCount} more attendees`}
          title={`Show ${hiddenCount} more`}
        >
          +{hiddenCount}
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .attendees-block {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 14px;
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }

  h2 {
    margin: 0;
    font-size: 18px;
    color: #111827;
  }

  .count {
    color: #6b7280;
    font-weight: 500;
  }

  .toggle {
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 13px;
    cursor: pointer;
  }
  .toggle:hover {
    background: #f3f4f6;
  }

  .empty {
    color: #6b7280;
    font-size: 14px;
    padding: 8px 0;
  }

  .avatars {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .avatar-link {
    display: inline-flex;
    border-radius: 999px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
    width: 44px;
    height: 44px;
    background: #fff;
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }

  .avatar-link:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  }

  .avatar-img {
    width: 44px;
    height: 44px;
    object-fit: cover;
    display: block;
  }

  .more {
    width: 44px;
    height: 44px;
    border-radius: 999px;
    border: 1px dashed #cbd5e1;
    background: #f9fafb;
    cursor: pointer;
    font-size: 13px;
    color: #111827;
  }

  .more:hover {
    background: #f3f4f6;
  }
</style>
