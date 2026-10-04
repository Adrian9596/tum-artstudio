/* TUM.Artstudio — header dính, menu điện thoại, slideshow (nếu có), xem ảnh lớn (lightbox).
   Không dùng thư viện ngoài. Khi tắt JavaScript, trang vẫn đọc và bấm link được. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ICON_PREV = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4l-8 8 8 8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
  var ICON_NEXT = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
  var ICON_CLOSE = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';

  /* ---------- Năm ở footer ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Header: thêm bóng nhẹ khi cuộn xuống ---------- */
  var header = document.querySelector('[data-header]');
  if (header) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Menu trên điện thoại ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');

  if (toggle && nav) {
    var navClose = nav.querySelector('.nav-close');
    var isOpen = function () { return document.body.classList.contains('nav-open'); };

    var setNav = function (open) {
      document.body.classList.toggle('nav-open', open);
      document.body.classList.toggle('no-scroll', open);
      toggle.setAttribute('aria-expanded', String(open));
      if (open) {
        var first = nav.querySelector('.nav-list a');
        if (first) first.focus();
      } else {
        toggle.focus();
      }
    };

    toggle.addEventListener('click', function () { setNav(!isOpen()); });
    if (navClose) navClose.addEventListener('click', function () { setNav(false); });

    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') {
        setNav(false);
      } else if (e.key === 'Tab') {
        // Giữ phím Tab trong menu khi menu đang mở
        var items = Array.prototype.slice.call(nav.querySelectorAll('a[href], button'))
          .filter(function (el) { return el.offsetParent !== null; });
        if (!items.length) return;
        var firstEl = items[0], lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      }
    });

    // Bấm một link trong menu (kể cả link neo cùng trang) thì đóng menu
    nav.addEventListener('click', function (e) {
      if (isOpen() && e.target.closest('a[href]')) {
        document.body.classList.remove('nav-open', 'no-scroll');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Xoay ngang / phóng to màn hình sang bố cục máy tính thì bỏ trạng thái mở
    window.matchMedia('(min-width: 960px)').addEventListener('change', function (mq) {
      if (mq.matches && isOpen()) {
        document.body.classList.remove('nav-open', 'no-scroll');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Slideshow (giữ cho trường hợp trang có dùng) ---------- */
  document.querySelectorAll('[data-slideshow]').forEach(function (root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('.slide'));
    if (slides.length < 2) return;

    var delay = parseInt(root.getAttribute('data-slideshow'), 10) || 5500;
    var dotsWrap = root.querySelector('.slide-dots');
    var prev = root.querySelector('.slide-prev');
    var next = root.querySelector('.slide-next');
    var current = 0;
    var timer = null;

    var loadFull = function (slide) {
      var img = slide.querySelector('img[data-full]');
      if (!img) return;
      img.src = img.getAttribute('data-full');
      img.removeAttribute('data-full');
    };

    var dots = slides.map(function (slide, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Xem ảnh ' + (i + 1) + ' trên ' + slides.length);
      b.addEventListener('click', function () { go(i); restart(); });
      dotsWrap.appendChild(b);
      if (i > 0) slide.setAttribute('aria-hidden', 'true');
      return b;
    });

    function go(i) {
      slides[current].classList.remove('is-active');
      slides[current].setAttribute('aria-hidden', 'true');
      dots[current].removeAttribute('aria-current');
      current = (i + slides.length) % slides.length;
      loadFull(slides[current]);
      slides[current].classList.add('is-active');
      slides[current].removeAttribute('aria-hidden');
      dots[current].setAttribute('aria-current', 'true');
      loadFull(slides[(current + 1) % slides.length]);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() {
      if (reduceMotion) return;
      stop();
      timer = setInterval(function () { go(current + 1); }, delay);
    }
    function restart() { stop(); start(); }

    dots[0].setAttribute('aria-current', 'true');
    prev.innerHTML = ICON_PREV;
    next.innerHTML = ICON_NEXT;
    prev.hidden = false;
    next.hidden = false;
    prev.addEventListener('click', function () { go(current - 1); restart(); });
    next.addEventListener('click', function () { go(current + 1); restart(); });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(current - 1); }
      if (e.key === 'ArrowRight') { go(current + 1); }
    });
    var x0 = null;
    root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
      x0 = null;
      start();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stop(); } else { start(); }
    });
    loadFull(slides[1]);
    start();
  });

  /* ---------- Lightbox: bấm ảnh để xem lớn ---------- */
  var lb = null, lbImg, lbCap, lbCount, items = [], index = 0, lastFocus = null;

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.hidden = true;
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Xem ảnh lớn');
    lb.innerHTML =
      '<p class="lb-count" aria-live="polite"></p>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="lb-btn lb-close" aria-label="Đóng">' + ICON_CLOSE + '</button>' +
      '<button type="button" class="lb-btn lb-prev" aria-label="Ảnh trước">' + ICON_PREV + '</button>' +
      '<button type="button" class="lb-btn lb-next" aria-label="Ảnh sau">' + ICON_NEXT + '</button>';
    document.body.appendChild(lb);

    lbImg = lb.querySelector('img');
    lbCap = lb.querySelector('figcaption');
    lbCount = lb.querySelector('.lb-count');

    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(index - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(index + 1); });

    // Bấm ra ngoài ảnh thì đóng
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.tagName === 'FIGURE') close();
    });

    lb.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); }
      else if (e.key === 'ArrowLeft') { show(index - 1); }
      else if (e.key === 'ArrowRight') { show(index + 1); }
      else if (e.key === 'Tab') {
        // Giữ phím Tab trong hộp xem ảnh
        var btns = Array.prototype.slice.call(lb.querySelectorAll('button:not([hidden])'));
        var pos = btns.indexOf(document.activeElement);
        e.preventDefault();
        btns[(pos + (e.shiftKey ? -1 : 1) + btns.length) % btns.length].focus();
      }
    });

    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  function show(i) {
    index = (i + items.length) % items.length;
    var it = items[index];
    lbImg.src = it.href;
    lbImg.alt = it.alt;
    lbCap.textContent = it.caption;
    lbCount.textContent = (index + 1) + ' / ' + items.length;
    var single = items.length < 2;
    lb.querySelector('.lb-prev').hidden = single;
    lb.querySelector('.lb-next').hidden = single;
    if (!single) { new Image().src = items[(index + 1) % items.length].href; }
  }

  function open(list, i) {
    if (!lb) buildLightbox();
    items = list;
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.classList.add('no-scroll');
    lb.querySelector('.lb-close').focus();
  }

  function close() {
    lb.hidden = true;
    lbImg.removeAttribute('src');
    document.body.classList.remove('no-scroll');
    if (lastFocus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-gallery] a[href]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    var anchors = Array.prototype.slice.call(a.closest('[data-gallery]').querySelectorAll('a[href]'));
    var list = anchors.map(function (x) {
      var im = x.querySelector('img');
      var alt = x.getAttribute('data-alt') || (im ? im.alt : '');
      return { href: x.getAttribute('href'), alt: alt, caption: x.getAttribute('data-caption') || alt };
    });
    open(list, anchors.indexOf(a));
  });
})();
