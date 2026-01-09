<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let length = 6;
  export let value = "";
  export let disabled = false;

  let inputs: HTMLInputElement[] = [];
  let otp = Array(length).fill("");

  // синхронизация внешнего value
  $: if (value && value.length === length) {
    otp = value.split("");
  }

  function handleInput(e: Event, index: number) {
    const target = e.target as HTMLInputElement;
    let val = target.value.replace(/\D/g, "");

    if (!val) {
      otp[index] = "";
      dispatch("change", otp.join(""));
      return;
    }

    otp[index] = val[0];

    if (index < length - 1) {
      inputs[index + 1].focus();
    }

    dispatch("change", otp.join(""));
  }

  function handleKeydown(e: KeyboardEvent, index: number) {
    if (e.key === "Backspace") {
      if (otp[index] === "") {
        if (index > 0) {
          otp[index - 1] = "";
          inputs[index - 1].focus();
        }
      } else {
        otp[index] = "";
      }
      dispatch("change", otp.join(""));
    }
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData?.getData("text") ?? "";
    const digits = text.replace(/\D/g, "").slice(0, length);

    if (!digits) return;

    digits.split("").forEach((d, i) => (otp[i] = d));

    dispatch("change", otp.join(""));

    const last = digits.length - 1;
    if (inputs[last]) inputs[last].focus();
  }
</script>

<div class="otp-wrapper" on:paste={handlePaste}>
  {#each otp as d, i}
    <input
      class="otp-box"
      bind:this={inputs[i]}
      bind:value={otp[i]}
      maxlength="1"
      inputmode="numeric"
      pattern="\d*"
      {disabled}
      on:input={(e) => handleInput(e, i)}
      on:keydown={(e) => handleKeydown(e, i)}
    />
  {/each}
</div>

<style>
  .otp-wrapper {
    display: flex;
    justify-content: center;
    gap: 0.7rem;
    margin: 1.2rem 0;
  }

  .otp-box {
    width: 52px;
    height: 62px;
    border-radius: 10px;
    background: #ffffff;
    border: 1px solid #3d3d3d;
    color: #0b3954;
    font-size: 1.7rem;
    text-align: center;
    font-weight: 700;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    transition: 0.15s border, 0.15s box-shadow, 0.15s background;
  }

  .otp-box:focus {
    border-color: #0b3954;
    background: #f3f7fa;
    box-shadow: 0 0 0 3px rgba(11,57,84,0.25);
    outline: none;
  }

  .otp-box:disabled {
    opacity: 0.55;
    background: #f1f1f1;
    cursor: not-allowed;
  }
</style>
