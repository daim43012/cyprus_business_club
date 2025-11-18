<script lang="ts">
  import { onMount } from "svelte";

  interface User {
    id: string;
    name?: string;
    email: string;
    createdAt?: string;
    role?: string;
    bio?: string;
    photo?: string;
    status?: string;
  }

  let user: User | null = null;
  let loading = true;

  let followersCount = 0;
  let followingCount = 0;

  onMount(async () => {
    try {
      // --- 1. Загружаем профиль ---
      const res = await fetch("/api/user/profile");

      if (!res.ok) {
        window.location.href = "/login";
        return;
      }

      const data = await res.json();

      user = {
        id: data.id,
        email: data.email,
        name: data.info?.name || "Unnamed",
        photo: data.info?.photo || "",
        status: "online",
        role: data.info?.status || "Member",
        bio: data.info?.bio || "No bio provided yet.",
        createdAt: data.createdAt,
      };

      const followRes = await fetch(`/api/member/followers?userId=${user.id}`);
      if (followRes.ok) {
        const followData = await followRes.json();
        followersCount = followData.counts.followers;
        followingCount = followData.counts.following;
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      window.location.href = "/login";
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="loader">Loading profile...</div>
{:else if user}
  <div class="profile-card">
    <div class="profile-header">
      <img
        src={user.photo
          ? `/api/photo/${user.photo.split("/").pop()}`
          : "https://api.dicebear.com/7.x/initials/svg?seed=" +
            (user.name || "User")}
        alt="Profile photo"
        class="profile-photo"
      />

      <div class="user-info">
        <h2>{user.name}</h2>
        <span class="badge">{user.role}</span>
        <p class="bio">{user.bio}</p>
      </div>
    </div>

    <div class="divider"></div>

    <div class="profile-info">
      <div class="status">
        <span class="dot online"></span>
        Online now
      </div>
      {#if user.createdAt}
        <div class="joined">
          <span class="icon">📅</span>
          Joined {new Date(user.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      {/if}
    </div>
    <div class="stats">
      <div>
        <strong>{followersCount}</strong>
        <span>Followers</span>
      </div>
      <div>
        <strong>{followingCount}</strong>
        <span>Following</span>
      </div>
    </div>
  </div>
{:else}
  <p class="error">User not found.</p>
{/if}

<style>
  .profile-card {
    background: #fff;
    border-radius: 1rem;
    padding: 2rem 1.5rem;
    max-width: 450px;
    margin: 2rem 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    color: #0b3954;
  }

  /* HEADER */
  .profile-header {
    display: flex;
    align-items: flex-start;
    gap: 1.2rem;
  }

  .profile-photo {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e2e8f0;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
  }

  h2 {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
  }

  .username {
    color: #64748b;
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
  }

  .badge {
    display: inline-block;
    background: linear-gradient(90deg, #4f46e5, #6366f1);
    color: #fff;
    font-size: 0.75rem;
    padding: 0.25rem 0.7rem;
    border-radius: 0.5rem;
    font-weight: 500;
    text-transform: capitalize;
    box-shadow: 0 0 6px rgba(99, 102, 241, 0.5);
    margin-bottom: 0.5rem;
  }

  .bio {
    font-size: 0.85rem;
    color: #475569;
  }

  .divider {
    border-bottom: 1px solid #e2e8f0;
    margin: 1rem 0;
  }

  /* INFO + STATS */
  .profile-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 0.6rem;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .online {
    background: #16a34a;
  }

  .joined {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: #475569;
  }

  .stats {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    text-align: center;
  }

  .stats div {
    display: flex;
    flex-direction: column;
    font-size: 0.9rem;
  }

  .stats strong {
    font-size: 1.1rem;
    color: #0b3954;
  }

  /* BUTTON */
  .btn {
    margin-top: 1.5rem;
    background: #1e1b4b;
    color: #fff;
    border: none;
    border-radius: 9999px;
    padding: 0.8rem 2rem;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s ease;
    width: 100%;
  }

  .btn:hover {
    background: #312e81;
  }

  /* RESPONSIVE */
  @media (max-width: 640px) {
    .profile-card {
      margin: 1.5rem auto;
      text-align: center;
    }

    .profile-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .user-info {
      align-items: center;
    }

    .badge {
      margin-top: 0.3rem;
    }

    .profile-info {
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
    }

    .stats {
      justify-content: center;
      gap: 1.5rem;
    }
  }

  .loader {
    text-align: center;
    color: #475569;
    padding: 2rem;
  }

  .error {
    text-align: center;
    color: #b91c1c;
    margin-top: 2rem;
  }
</style>
