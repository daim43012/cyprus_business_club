<script lang="ts">
  import { onMount } from "svelte";
  import "leaflet/dist/leaflet.css";

  let fullName = "";
  let dob = "";
  let location = "";
  let email = "";
  let phone = "";
  let bio = ""; // 🆕 новое поле для описания
  let photo: File | null = null;
  let photoPreview = "";
  let saving = false;
  let isPrivate = false;

  let mapContainer: HTMLDivElement;
  let map: any;
  let marker: any;
  let isMapVisible = false;

  // 🟢 Загружаем профиль
  onMount(async () => {
    const res = await fetch("/api/user/profile");
    if (!res.ok) return;
    const user = await res.json();

    email = user.email ?? "";
    fullName = user.info?.name ?? "";
    dob = user.info?.dateOfBirth?.split("T")[0] ?? "";
    location = user.info?.location ?? "";
    phone = user.info?.phoneNumber ?? "";
    photoPreview = user.info?.photo ?? "";
    bio = user.info?.bio ?? "";
    isPrivate = user.settings?.isPrivate ?? false;
  });

  const handlePhotoUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      photo = target.files[0];
      photoPreview = URL.createObjectURL(photo);
    }
  };

  const handleSave = async () => {
    saving = true;
    const form = new FormData();
    form.append("fullName", fullName);
    form.append("dob", dob);
    form.append("location", location);
    form.append("phone", phone);
    form.append("bio", bio); // 🆕 добавляем описание
    form.append("isPrivate", String(isPrivate));

    if (photo) form.append("photo", photo);

    const res = await fetch("/api/user/profile", {
      method: "POST",
      body: form,
    });

    saving = false;
    if (!res.ok) console.error("❌ Save failed");
  };

  async function getAddress(lat: number, lng: number) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
    );
    const data = await res.json();
    if (data && data.display_name) location = data.display_name;
    else location = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }

  async function initMap() {
    if (map) return;
    const L = await import("leaflet");
    map = L.map(mapContainer).setView([40.7128, -74.006], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    marker = L.marker([40.7128, -74.006], { draggable: true }).addTo(map);
    getAddress(40.7128, -74.006);

    marker.on("dragend", async () => {
      const { lat, lng } = marker.getLatLng();
      await getAddress(lat, lng);
    });

    map.on("click", async (e: any) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      await getAddress(lat, lng);
    });
  }

  const toggleMap = async () => {
    isMapVisible = !isMapVisible;
    if (isMapVisible) {
      await initMap();
      setTimeout(() => map.invalidateSize(), 100);
    }
  };
</script>

<section class="profile-form">
  <div class="form-field">
    <label>Full name</label>
    <input class="input-group" type="text" bind:value={fullName} />
  </div>

  <div class="form-field">
    <label>About me</label>
    <textarea
      class="input-group textarea"
      placeholder="Tell us a bit about yourself..."
      bind:value={bio}
      rows="4"
    ></textarea>
  </div>

  <div class="form-field">
    <label>Date of birth</label>
    <input class="input-group" type="date" bind:value={dob} />
  </div>

  <div class="form-field">
    <label>Location</label>
    <input
      class="input-group"
      type="text"
      placeholder="Click to choose location"
      bind:value={location}
      readonly
      on:click={toggleMap}
    />
    {#if isMapVisible}
      <div bind:this={mapContainer} class="map"></div>
    {/if}
  </div>

  <div class="form-field">
    <label>Photo</label>
    <div class="input-group photo-upload">
      <span class="upload-label">📷 Upload photo</span>
      <input type="file" accept="image/*" on:change={handlePhotoUpload} />
      {#if photoPreview}
        <img src={photoPreview} alt="Preview" class="photo-preview" />
      {/if}
    </div>
  </div>

  <div class="form-field">
    <label>Email</label>
    <input class="input-group" type="email" bind:value={email} readonly />
  </div>

  <div class="form-field">
    <label>Phone number</label>
    <input class="input-group" type="tel" bind:value={phone} />
  </div>
  <div class="form-field">
    <div class="visibility-row">
      <label class="switch">
        <input type="checkbox" bind:checked={isPrivate} />
        <span class="slider"></span>
      </label>

      <span class="visibility-text">
        {isPrivate ? "Private profile" : "Public profile"}
      </span>
    </div>

    <button class="btn primary" on:click={handleSave} disabled={saving}>
      {saving ? "💾 Saving..." : "💾 Save changes"}
    </button>
  </div>
</section>

<style>
  .visibility-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 12px 0;
  }

  .visibility-label {
    font-size: 0.95rem;
    color: #0b3954;
    font-weight: 500;
    white-space: nowrap;
  }

  .visibility-text {
    font-size: 0.9rem;
    color: #475569;
    white-space: nowrap;
  }

  /* Switch */
  .switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 22px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #cbd5e1;
    transition: 0.3s;
    border-radius: 22px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #0b3954;
  }

  input:checked + .slider:before {
    transform: translateX(22px);
  }

  .textarea {
    resize: none;
    border-radius: 1rem;
    background: #f1f5f9;
    border: 1px solid transparent;
    padding: 0.8rem 1rem;
    font-size: 1rem;
    width: 70%;
    max-width: 420px;
    outline: none;
    transition: all 0.2s ease;
  }

  .textarea:hover {
    background: #e2e8f0;
    border: 1px solid #5ca5ff;
  }

  .profile-form {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  label {
    font-size: 0.9rem;
    color: #334155;
    margin-bottom: 0.3rem;
    font-weight: 500;
  }

  input[type="text"],
  input[type="date"],
  input[type="email"],
  input[type="tel"] {
    background: #f1f5f9;
    border-radius: 9999px;
    border: 1px solid transparent;
    padding: 0.6rem 1rem;
    font-size: 1rem;
    color: #0b3954;
    transition: all 0.2s ease;
    width: 70%;
    max-width: 420px;
    outline: none;
  }

  input:hover {
    background: #e2e8f0;
    border: 1px solid #5ca5ff;
  }

  .input-group {
    cursor: pointer;
  }

  .map {
    width: 70%;
    max-width: 420px;
    height: 250px;
    border-radius: 0.8rem;
    margin-top: 0.6rem;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .photo-upload {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f8fafc;
    border-radius: 9999px;
    border: 1px solid transparent;
    padding: 0.6rem 1rem;
    width: 70%;
    max-width: 420px;
    color: #334155;
    font-size: 1rem;
    transition: all 0.2s ease;
  }

  .photo-upload:hover {
    background: #f1f5f9;
    border: 1px solid #5ca5ff;
  }

  .photo-preview {
    position: absolute;
    right: 0.6rem;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e2e8f0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    pointer-events: none;
  }

  .photo-upload:hover {
    background: #f1f5f9;
    border: 1px solid #5ca5ff;
  }

  .photo-upload input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .photo-upload .upload-label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: #0b3954;
  }

  .btn.primary {
    margin-top: 0.8rem;
    background: #1e1b4b;
    color: white;
    border: none;
    border-radius: 9999px;
    padding: 0.8rem 1rem;
    font-size: 1rem;
    cursor: pointer;
    width: 70%;
    max-width: 420px;
    align-self: flex-start;
  }

  .btn.primary:hover {
    background: #312e81;
  }

  .btn.primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #94a3b8;
  }

  @media (max-width: 768px) {
    .input-group,
    .map,
    .btn.primary {
      width: 100%;
    }
  }
</style>
