import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')

if (app) {
  app.innerHTML = `
    <main class="app-shell">
      <h1>Cyber Fortune</h1>
      <p class="subtitle">赛博占卜体验即将来到这里。</p>
    </main>
  `
}
