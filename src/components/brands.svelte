<script lang="ts">
  type BrandLogo = {
    id: string;
    name: string;
    logoUrl: string | null;
  };

  export let brands: BrandLogo[] = [];

  const initial = (name: string) =>
    (name || '?').trim().charAt(0).toUpperCase();
</script>

<section class="partners">
  <h1>Our partners</h1>

  {#if !brands.length}
    <div class="empty">Пока нет брендов</div>
  {:else}
    <div class="logos-row">
      {#each brands as brand}
        <a
          class="logo-item"
          href={`/brand/${brand.id}`}
          title={brand.name}
        >
          {#if brand.logoUrl}
            <img src={brand.logoUrl} alt={brand.name} />
          {:else}
            <span class="fallback">{initial(brand.name)}</span>
          {/if}
        </a>
      {/each}
    </div>
  {/if}
</section>

<style>
  .partners {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 16px 32px;
    text-align: center;
    color: #0b3954;
  }

  .partners h1 {
    margin: 0 0 28px;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 0.03em;
  }

  .empty {
    font-size: 14px;
    opacity: 0.7;
  }

  .logos-row {
    display: flex;
    flex-wrap: wrap;
    gap: 24px 32px;
    justify-content: center;
  }

  /* Логотипы БОЛЬШЕ */
  .logo-item {
    width: 96px;
    height: 96px;
    border-radius: 999px;
    background: #ffffff;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.22);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid rgba(15, 23, 42, 0.06);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease;
    text-decoration: none;
  }

  .logo-item img {
    width: 76%;
    height: 76%;
    object-fit: cover;
  }

  .fallback {
    font-size: 34px;
    font-weight: 700;
    color: #0b3954;
  }

  .logo-item:hover {
    transform: translateY(-4px) scale(1.04);
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.28);
    border-color: rgba(59, 130, 246, 0.6);
    background-color: #f9fbff;
  }

  @media (max-width: 640px) {
    .partners {
      padding-top: 28px;
    }

    .partners h1 {
      font-size: 22px;
      margin-bottom: 20px;
    }

    .logo-item {
      width: 80px;
      height: 80px;
    }
  }
</style>
