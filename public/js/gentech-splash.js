(function () {
  const DURATION = 5000;

  function startSplash() {
    if (document.getElementById('gentech-splash')) return;

    const splash = document.createElement('div');
    splash.id = 'gentech-splash';
    splash.innerHTML = `
      <picture class="gentech-splash-picture">
        <source media="(max-width: 767px)" srcset="/assets/gentech-splash-mobile.png">
        <img class="gentech-splash-image" src="/assets/gentech-splash-desktop.png" alt="GenTech College Management">
      </picture>
      <div class="gentech-splash-sheen"></div>
      <div class="gentech-splash-progress">
        <div class="gentech-splash-track"><span></span></div>
      </div>
    `;
    document.body.prepend(splash);
    requestAnimationFrame(() => splash.classList.add('show'));

    const finish = () => {
      splash.classList.add('hide');
      setTimeout(() => splash.remove(), 650);
    };
    setTimeout(finish, DURATION);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSplash, { once: true });
  } else {
    startSplash();
  }
})();