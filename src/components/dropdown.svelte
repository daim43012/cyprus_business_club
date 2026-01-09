<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  export let label: string;
  let open = false;
  let dropdownEl: HTMLDivElement;

  function toggle() {
    open = !open;
  }

  function handleClickOutside(e: MouseEvent) {
    // composedPath() надёжнее, чем contains, для разных случаев DOM
    const path = e.composedPath();
    if (dropdownEl && !path.includes(dropdownEl)) {
      open = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<div class="dropdown" bind:this={dropdownEl}>
  <button class="trigger" on:click={toggle}>
    {label}
    <ion-icon name="chevron-down-outline"></ion-icon>
  </button>

  {#if open}
    <div class="menu">
      <slot />
    </div>
  {/if}
</div>

<style>
  .dropdown {
    position: relative;
  }

  .trigger {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 500;
    color: #334155;
  }

  .menu {
    position: absolute;
    top: 32px;
    left: 0;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    padding: 8px 0;
    display: flex;
    flex-direction: column;
    min-width: 160px;
    z-index: 999;
  }

  .menu a {
    padding: 8px 14px;
    text-decoration: none;
    color: #334155;
    white-space: nowrap;
    display: flex;          /* чтобы иконка + текст красиво шли */
    align-items: center;
    gap: 8px;
  }

  .menu a:hover {
    background: #f1f5f9;
  }

  /* если захочешь использовать item-icon прямо в slot */
  .item-icon {
    width: 18px;
    height: 18px;
    display: inline-grid;
    place-items: center;
    opacity: 0.9;
  }
</style>
