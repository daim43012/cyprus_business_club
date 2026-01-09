<script lang="ts">
  import { onMount } from "svelte";
  import Sparkline from "./Sparkline.svelte";
  import CustodyAuthModal from "./CustodyAuthModal.svelte";
  import DepositModal from "./custody/DepositModal.svelte";
  import WithdrawModal from "./custody/WithdrawModal.svelte";
  import TransferModal from "./custody/TransferModal.svelte";
  import Secret from "./custody/Secret.svelte";
  import ContextAssistant from "./ContextAssistant.svelte";

  export let data;

  let loggedIn = false;
  let authModal = false;

  let email = data?.user?.email ?? "";

  let depositModal = false;
  let withdrawModal = false;
  let transferModal = false;

  let walletAddress = "";
  let copied = false;

  // ✅ режим секрет/кошелёк
  let showSecret = false;

  let balances = [
    { name: "USDT", logo: "/assets/images/usdt.png", balance: "0.00" },
    { name: "POL", logo: "/assets/images/pol.png", balance: "0.00" },
  ];

  onMount(async () => {
    const ok = await tryLoadWallet();
    loggedIn = ok;
  });

  async function tryLoadWallet() {
    const res = await fetch("/api/custody/wallets");
    if (res.status !== 200) return false;

    const wallets = await res.json();
    walletAddress = wallets[0]?.address || "";

    await loadBalances();
    return true;
  }

  async function loadBalances() {
    if (!walletAddress) return;

    const res = await fetch(`/api/custody/balances?wallet=${walletAddress}`);
    const data = await res.json();

    balances = [
      {
        name: "USDT",
        logo: "/assets/images/usdt.png",
        balance: data.usdt.toFixed(2),
      },
      {
        name: "POL",
        logo: "/assets/images/pol.png",
        balance: data.pol.toFixed(4),
      },
    ];
  }

  function copyAddress() {
    navigator.clipboard.writeText(walletAddress);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }

  function toggleSecretView() {
    showSecret = !showSecret;

    // закрываем модалки, если были открыты
    depositModal = false;
    withdrawModal = false;
    transferModal = false;
  }
</script>

{#if authModal}
  <CustodyAuthModal
    email={data?.user?.email}
    address={data?.user?.info?.custodyAddress}
    open={authModal}
    on:close={() => (authModal = false)}
    on:success={() => {
      authModal = false;
      loggedIn = true;
      tryLoadWallet();
    }}
    on:created={(e) => {
      authModal = false;
      walletAddress = e.detail.wallet;
      loggedIn = true;
      tryLoadWallet();
    }}
  />
{/if}
<ContextAssistant
  contextKey="custody"
  payload={"кастодный кошелёк "}
  title="Помощник по кошельку"
/>
<div class="wrapper">
  <div class="custody-card">

    <!-- ✅ HEADER ВСЕГДА ОДИН -->
    <div class="wallet-header">
      <div class="header-top">
        {#if showSecret}
          <h2 class="muted-title">Wallet Secret</h2>
        {:else}
          <h2 class="muted-title">Wallet</h2>
        {/if}

        <!-- ✅ КНОПКА СПРАВА ВСЕГДА, ИКОНКА МЕНЯЕТСЯ -->
        <button
          class="settings-btn"
          aria-label="Toggle secret/wallet view"
          on:click={toggleSecretView}
        >
          {#if showSecret}
            <ion-icon name="wallet-outline"></ion-icon>
          {:else}
            <ion-icon name="settings-outline"></ion-icon>
          {/if}
        </button>
      </div>

      <!-- показываем статус и адрес только когда НЕ секрет -->
      {#if !showSecret}
        <div
          class="status-indicator"
          on:click={() => {
            if (!loggedIn) authModal = true;
          }}
        >
          {#if loggedIn}
            <span class="dot connected"></span>
            <span class="status-text">Connected</span>
          {:else}
            <span class="dot disconnected"></span>
            <span class="status-text clickable">Disconnected</span>
          {/if}
        </div>

        {#if loggedIn}
          <div class="address-row">
            <span class="wallet-address">{walletAddress}</span>

            <button class="copy-btn" on:click={copyAddress}>
              <ion-icon
                name={copied ? "checkmark-done-outline" : "copy-outline"}
              />
            </button>
          </div>
        {/if}
      {/if}
    </div>

    <!-- ✅ BODY -->
    {#if showSecret}
      <div class="secret-wrap">
        <Secret />
      </div>
    {:else}
      {#if loggedIn}
        <div class="balances">
          {#each balances as item}
            <div class="balance-row">
              <div class="left">
                <img src={item.logo} alt={item.name} class="logo" />

                <div class="info">
                  <span class="name">{item.name}</span>
                  <span class="amount">{item.balance}</span>
                </div>
              </div>

              <div class="right">
                {#if item.name === "POL"}
                  <Sparkline symbol="POL" quote="USDT" />
                {:else if item.name === "USDT"}
                  <Sparkline symbol="USDC" quote="USDT" />
                {:else}
                  <div class="sparkline-placeholder"></div>
                {/if}
              </div>
            </div>
          {/each}
        </div>

        <DepositModal
          open={depositModal}
          wallet={walletAddress}
          on:close={() => (depositModal = false)}
        />

        <WithdrawModal
          open={withdrawModal}
          wallet={walletAddress}
          on:close={() => (withdrawModal = false)}
          on:success={() => {
            withdrawModal = false;
            loadBalances();
          }}
        />

        <TransferModal
          open={transferModal}
          on:close={() => (transferModal = false)}
          on:success={() => {
            transferModal = false;
            loadBalances();
          }}
        />

        <div class="actions">
          <button class="btn deposit" on:click={() => (depositModal = true)}>
            Пополнить
          </button>
          <button class="btn withdraw" on:click={() => (withdrawModal = true)}>
            Вывести
          </button>
          <button class="btn transfer" on:click={() => (transferModal = true)}>
            Перевести
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  /* WRAPPER */
  .wrapper {
    width: min(90%, 70rem);
    margin: 3rem auto;
    padding: 0 1rem;
    display: flex;
    justify-content: flex-start;
  }

  /* CARD */
  .custody-card {
    background: #fff;
    border-radius: 1rem;
    padding: 2rem;
    width: 100%;
    max-width: 1100px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.05);
    color: #0b3954;
    transition: box-shadow 0.25s ease;
    position: relative;
  }

  .custody-card:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }

  /* WALLET HEADER */
  .wallet-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between; /* ✅ кнопка всегда справа */
    gap: 12px;
  }

  .wallet-header h2 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: #0b3954;
  }

  .muted-title {
    opacity: 0.85;
    font-size: 1.7rem;
    font-weight: 700;
    margin: 0;
    color: #0b3954;
  }

  /* ✅ GEAR/WALLET BUTTON */
  .settings-btn {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: 0.2s;
    color: #0b3954;
    flex-shrink: 0;
  }

  .settings-btn ion-icon {
    font-size: 20px;
  }

  .settings-btn:hover {
    background: #eef2f7;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
  }

  .secret-wrap {
    margin-top: 8px;
  }

  .address-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.4rem;
  }

  .wallet-address {
    opacity: 0.7;
    font-size: 1.1rem;
    letter-spacing: 0.4px;
  }

  /* COPY BUTTON */
  .copy-btn {
    background: none;
    border: none;
    color: #99a2ad;
    cursor: pointer;
    padding: 6px;
    display: flex;
    align-items: center;
    transition: color 0.2s, transform 0.15s;
    font-size: 1.3rem;
    border-radius: 6px;
  }

  .copy-btn:hover {
    color: #0b3954;
    transform: scale(1.12);
  }

  .copy-btn:active {
    transform: scale(0.95);
  }

  .copy-btn ion-icon {
    font-size: 1.35rem;
  }

  /* BALANCE ROWS */
  .balances {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .balance-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .logo {
    width: 36px;
    height: 36px;
  }

  .info {
    display: flex;
    flex-direction: column;
  }

  .name {
    font-weight: 600;
  }

  .amount {
    opacity: 0.7;
    font-size: 1rem;
    font-weight: bold;
  }

  .sparkline-placeholder {
    width: 130px;
    height: 40px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 6px;
  }

  /* ACTION BUTTONS */
  .actions {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
  }

  .btn {
    width: 100%;
    padding: 0.9rem 1.5rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    background: #0b3954;
    color: #fff;
    font-weight: 600;
    transition: 0.2s;
    font-size: 1.1rem;
  }

  .btn:hover {
    opacity: 0.9;
  }

  .withdraw {
    background: #a83232;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.9rem;
    font-weight: 600;
    margin-left: auto;
    cursor: pointer;
    margin-top: 6px;
  }

  .status-text.clickable {
    text-decoration: underline;
    cursor: pointer;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .connected {
    background: #2ecc71;
  }

  .disconnected {
    background: #e74c3c;
  }
</style>
