<script lang="ts">
  let name = "";
  let success = false;
  let error = "";

  const handleCreate = async () => {
    if (!name.trim()) {
      error = "Please enter category name.";
      return;
    }
    error = "";
    success = false;

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      success = true;
      name = "";
    } else {
      const data = await res.json();
      error = data.error || "Failed to create category";
    }
  };
</script>

<section class="category-create">
  <h1>🧩 Create Category</h1>

  <div class="form-field">
    <label>Category Name</label>
    <input type="text" bind:value={name} placeholder="e.g. Conferences" />
  </div>

  <button on:click={handleCreate} class="btn primary">Create</button>

  {#if success}
    <p class="success">✅ Category created successfully!</p>
  {/if}
  {#if error}
    <p class="error">{error}</p>
  {/if}
</section>

<style>
  section {
    max-width: 400px;
    margin: 2rem auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  input {
    padding: 0.6rem 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    width: 100%;
  }

  .btn.primary {
    background: #1e1b4b;
    color: white;
    padding: 0.8rem;
    border-radius: 8px;
    cursor: pointer;
    border: none;
  }

  .success {
    color: #16a34a;
  }
  .error {
    color: #dc2626;
  }
</style>
