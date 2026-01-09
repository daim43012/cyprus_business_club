<script lang="ts">
  type TeamMember = { name: string; role: string; email: string };
  export let team: TeamMember[] = [];

  function addTeamMember() {
    team = [...team, { name: "", role: "", email: "" }];
  }
  function removeTeamMember(idx: number) {
    team = team.filter((_, i) => i !== idx);
  }
</script>

<section class="card">
  <h2>Team</h2>

  {#if team.length === 0}
    <div class="muted">No members added yet</div>
  {/if}

  {#each team as m, i}
    <div class="team-row">
      <input bind:value={m.name} placeholder="Name" />
      <input bind:value={m.role} placeholder="Role" />
      <input bind:value={m.email} placeholder="Email" />
      <button type="button" class="danger" on:click={() => removeTeamMember(i)}>Remove</button>
    </div>
  {/each}

  <button type="button" on:click={addTeamMember}>+ Add member</button>
</section>


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
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
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

  .card {
    background: #fff;
    border-radius: 1rem;
    padding: 2rem;
    width: 100%;
    max-width: 1100px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(15, 23, 42, 0.05);
    color: #0b3954;
    transition: box-shadow 0.25s ease, transform 0.15s ease;
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
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
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

  .logo-preview {
    width: 120px;
    height: 120px;
    border-radius: 0.9rem;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .logo-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
    transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.12s ease,
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

  .danger {
    background: #ef4444;
    border-color: #b91c1c;
    color: #fef2f2;
  }

  .danger:hover {
    background: #dc2626;
    box-shadow: 0 3px 10px rgba(220, 38, 38, 0.25);
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

  .team-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr auto;
    gap: 10px;
    align-items: center;
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

  .menu-btn {
    width: 100%;
    justify-content: flex-start;
    background: #ffffff;
    color: #111827;
    border-color: #e5e7eb;
    padding: 10px 12px;
    border-radius: 0.7rem;
    box-shadow: none;
    transform: none;
    font-weight: 400;
  }

  .menu-btn:hover {
    background: #f3f4f6;
    box-shadow: none;
    transform: none;
  }

  .menu-btn.active {
    background: rgba(37, 99, 235, 0.08);
    border-color: rgba(37, 99, 235, 0.35);
    color: #1d4ed8;
  }

  @media (max-width: 768px) {
    .card {
      padding: 1.4rem;
    }

    .team-row {
      grid-template-columns: 1fr;
    }

    .wrap {
      padding-inline: 12px;
    }
  }
</style>
