document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('.menu-icon');
  const nav = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (menu && nav) {
    menu.addEventListener('click', () => nav.classList.toggle('open'));
    navLinks.forEach((link) => link.addEventListener('click', () => nav.classList.remove('open')));
  }

  // Highlight active nav link based on current path
  const path = location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (href === path || href === './' + path || (path === '' && (href === 'index.html' || href === '/'))) {
      link.classList.add('active');
    }
  });

  // Smooth scroll for same-page anchors
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Add lazy loading to images where supported
  document.querySelectorAll('img').forEach((img) => {
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
  });

  // Theme handling: respect system, persist preference, toggle with 't'
  const themeKey = 'site-theme';
  const stored = localStorage.getItem(themeKey);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (stored === 'dark' || (!stored && prefersDark)) document.body.classList.add('dark');

  document.addEventListener('keydown', (e) => {
    if (e.key && e.key.toLowerCase() === 't') {
      document.body.classList.toggle('dark');
      localStorage.setItem(themeKey, document.body.classList.contains('dark') ? 'dark' : 'light');
    }
  });
});
