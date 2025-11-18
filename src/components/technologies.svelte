<script lang="ts">
</script>

<!-- Заголовок вне карточек -->
<section class="tech-header">
  <h1>Integrated Technologies</h1>
  <p class="subtitle">
    В основе платформы лежат современные решения, обеспечивающие безопасность,
    удобство и интеллектуальные функции для пользователей.
  </p>
</section>

<section class="tech-section">

  <!-- Custodial Wallet -->
  <div class="tech-card">
    <h2>Custodial Wallet System (Polygon Network)</h2>

    <p>
      Платформа включает систему кастодиальных криптокошельков,
      работающих в сети <strong>Polygon (PoS)</strong>. Каждый пользователь
      автоматически получает защищённый кошелёк, связанный с аккаунтом.
    </p>

    <p class="list-title">Возможности системы:</p>

    <ul class="text-list">
      <li>внутренние платежи за мероприятия</li>
      <li>переводы средств между пользователями</li>
      <li>бескомиссионные операции внутри платформы</li>
      <li>поддержка токенов ERC-20</li>
      <li>автоматическая обработка транзакций</li>
    </ul>

    <p>
      Использование Polygon обеспечивает низкие комиссии и высокую скорость.
    </p>
  </div>

  <!-- AI Assistants -->
  <div class="tech-card">
    <h2>AI-Driven Assistants & Smart Interaction</h2>

    <p>
      На платформе будет развернута система интеллектуальных ассистентов,
      основанных на современных AI-моделях. Они предоставляют персонализированное
      взаимодействие и поддержку пользователям и организаторам.
    </p>

    <p class="list-title">Основные возможности AI:</p>

    <ul class="text-list">
      <li>умные чат-помощники</li>
      <li>AI-советники по мероприятиям</li>
      <li>инструменты для организаторов по улучшению контента</li>
      <li>автоматическая модерация фотографий и описаний</li>
      <li>AI-рекомендации на основе поведения пользователя</li>
    </ul>

    <p>
      Эти технологии создают персонализированный опыт и улучшают взаимодействие
      между всеми участниками платформы.
    </p>
  </div>

</section>

<style>
  /* Заголовок и подзаголовок */
  .tech-header {
    max-width: 800px;
    margin: 3rem auto 2rem auto;
    padding: 0 1rem;
    text-align: left; /* ← теперь выравнивание слева */
  }

  .tech-header h1 {
    font-size: 2.2rem;
    font-weight: 700;
    color: #0b3954;
    margin-bottom: 1rem;
  }

  .subtitle {
    font-size: 1.1rem;
    color: #475569;
    line-height: 1.6;
    max-width: 700px;
  }

  /* Секция карточек */
  .tech-section {
    max-width: 900px;
    margin: 0 auto 3rem auto;
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .tech-card {
    background: white;
    padding: 2rem;
    border-radius: 16px;
    text-align: left; /* ← выравнивание слева */
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    border: 1px solid #ffffff;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .tech-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.1);
  }

  .tech-card h2 {
    font-size: 1.4rem;
    font-weight: 700;
    color: #0b3954;
    margin-bottom: 1rem;
  }

  .tech-card p {
    color: #475569;
    font-size: 1rem;
    line-height: 1.55;
    margin-bottom: 1rem;
  }

  .list-title {
    font-weight: 600;
    color: #0b3954;
    margin: 1.2rem 0 0.5rem 0;
  }

  .text-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1.5rem 0;
  }

  .text-list li {
    padding-left: 1rem;
    margin-bottom: 0.7rem;
    position: relative;
    color: #475569;
    font-size: 0.98rem;
    line-height: 1.45;
  }

  .text-list li::before {
    content: "•";
    position: absolute;
    left: 0;
    top: 0.1rem;
    font-size: 1.3rem;
    color: #0b3954;
  }

  @media (max-width: 700px) {
    .tech-card {
      padding: 1.5rem;
    }
  }
</style>
