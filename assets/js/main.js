/* AI Safety Kaiserslautern — small progressive enhancements.
   Everything here is optional: the site works fine with JS disabled. */

(function () {
  'use strict';

  /* ---- Mobile navigation ---- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('nav-toggle');

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
    }
  }

  if (nav && navToggle) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    // Close after tapping a link, and on Escape.
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 780) closeNav();
    });
  }

  /* ---- Theme toggle (light / dark, remembered) ---- */
  var themeToggle = document.getElementById('theme-toggle');
  var root = document.documentElement;

  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set === 'light' || set === 'dark') return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---- Header hairline once the page is scrolled ---- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Resources: Learn / Communities / Careers as tabs ----
     Without JS the three groups simply sit side by side. */
  var res = document.querySelector('.res-columns');
  if (res) {
    var groups = Array.prototype.slice.call(res.querySelectorAll('.res-group'));
    var bar = document.createElement('div');
    bar.className = 'res-tabs';
    bar.setAttribute('role', 'tablist');
    bar.setAttribute('aria-label', 'Resource type');
    var tabs = groups.map(function (g, i) {
      var label = g.querySelector('.res-label');
      var id = 'res-panel-' + i;
      g.id = id;
      g.setAttribute('role', 'tabpanel');
      var t = document.createElement('button');
      t.type = 'button';
      t.className = 'res-tab';
      t.id = 'res-tab-' + i;
      t.setAttribute('role', 'tab');
      t.setAttribute('aria-controls', id);
      t.textContent = label ? label.textContent : 'Group ' + (i + 1);
      g.setAttribute('aria-labelledby', t.id);
      bar.appendChild(t);
      return t;
    });
    var select = function (i, focus) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        groups[k].hidden = !on;
      });
      if (focus) tabs[i].focus();
    };
    bar.addEventListener('click', function (e) {
      var t = e.target.closest('.res-tab');
      if (t) select(tabs.indexOf(t));
    });
    bar.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      if (e.key === 'ArrowRight') select((i + 1) % tabs.length, true);
      if (e.key === 'ArrowLeft') select((i - 1 + tabs.length) % tabs.length, true);
    });
    res.parentNode.insertBefore(bar, res);
    res.classList.add('has-tabs');
    select(0);
  }

  /* ---- Start a group: send in the background and show the result in place ----
     Without JS the browser posts the form and the page comes back with ?sent=1 or ?sent=0. */
  var startForm = document.getElementById('start-form');
  var startStatus = document.getElementById('start-status');
  var MAIL = 'hello@aisafetykaiserslautern.org';

  function showStatus(ok, text) {
    if (!startStatus) return;
    startStatus.hidden = false;
    startStatus.className = 'form-status ' + (ok ? 'is-ok' : 'is-error');
    startStatus.textContent = text;
  }
  var failText = 'Sorry, that did not go through. Please email us at ' + MAIL + '.';

  if (startForm) {
    var sent = new URLSearchParams(window.location.search).get('sent');
    if (sent === '1') showStatus(true, 'Thanks! We got your message and will get back to you.');
    if (sent === '0') showStatus(false, failText);

    startForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var button = startForm.querySelector('button[type="submit"]');
      button.disabled = true;
      fetch(startForm.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(startForm)
      }).then(function (r) {
        return r.json().catch(function () { return { ok: false }; });
      }).then(function (res) {
        if (res.ok) {
          startForm.reset();
          showStatus(true, 'Thanks! We got your message and will get back to you.');
        } else {
          showStatus(false, res.message && /check|fill/i.test(res.message) ? res.message + '.' : failText);
        }
      }).catch(function () {
        showStatus(false, failText);
      }).then(function () {
        button.disabled = false;
      });
    });
  }

  /* ---- Footer year ---- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
