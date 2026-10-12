'use strict';

(() => {
  const header = document.getElementById('header');
  const menuButton = document.querySelector('.menu-button');
  const navigation = document.getElementById('navigation');
  const navLinks = Array.from(navigation.querySelectorAll('a'));

  const setMenu = (open) => {
    navigation.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  };

  menuButton.addEventListener('click', () => {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
  });
  navLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuButton.focus();
    }
  });

  const desktopMedia = window.matchMedia('(min-width: 761px)');
  const onViewportChange = () => { if (desktopMedia.matches) setMenu(false); };
  if (desktopMedia.addEventListener) desktopMedia.addEventListener('change', onViewportChange);
  else if (desktopMedia.addListener) desktopMedia.addListener(onViewportChange);

  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 25);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const hash = '#' + entry.target.id;
        navLinks.forEach((link) => {
          const active = link.getAttribute('href') === hash;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    ['about', 'activity', 'projects', 'team', 'documents', 'contacts'].forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  // Поиск и категории работают без сервера, в том числе при открытии index.html.
  const search = document.getElementById('document-search');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const documents = Array.from(document.querySelectorAll('.document-row'));
  const documentCount = document.getElementById('document-count');
  const emptyMessage = document.getElementById('documents-empty');
  let category = 'all';
  const normalize = (text) => text.toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').trim();
  const fileWord = (count) => {
    if (count % 100 >= 11 && count % 100 <= 14) return 'файлов';
    if (count % 10 === 1) return 'файл';
    if (count % 10 >= 2 && count % 10 <= 4) return 'файла';
    return 'файлов';
  };
  const filterDocuments = () => {
    const words = normalize(search.value).split(/\s+/).filter(Boolean);
    let visible = 0;
    documents.forEach((row) => {
      const text = normalize(row.dataset.search + ' ' + row.textContent);
      const matchesCategory = category === 'all' || row.dataset.category === category;
      const matchesSearch = words.every((word) => text.includes(word));
      row.hidden = !(matchesCategory && matchesSearch);
      if (!row.hidden) visible++;
    });
    documentCount.textContent = visible + ' ' + fileWord(visible);
    emptyMessage.hidden = visible !== 0;
  };
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      category = button.dataset.filter;
      filterButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      filterDocuments();
    });
  });
  search.addEventListener('input', filterDocuments);
  filterDocuments();

  // Ссылки галереи сохраняют возможность открыть файл без JavaScript.
  const gallery = Array.from(document.querySelectorAll('[data-gallery]'));
  const dialog = document.getElementById('photo-dialog');
  const photo = document.getElementById('photo-image');
  const caption = document.getElementById('photo-caption');
  const photoCounter = document.getElementById('photo-counter');
  let photoIndex = 0;
  let galleryTrigger = null;
  const showPhoto = (index) => {
    photoIndex = (index + gallery.length) % gallery.length;
    const item = gallery[photoIndex];
    const sourceImage = item.querySelector('img');
    photo.src = item.getAttribute('href');
    photo.alt = item.dataset.caption;
    photo.width = sourceImage.width;
    photo.height = sourceImage.height;
    caption.textContent = item.dataset.caption;
    photoCounter.textContent = (photoIndex + 1) + ' / ' + gallery.length;
  };
  if (typeof dialog.showModal === 'function') {
    gallery.forEach((item, index) => {
      item.addEventListener('click', (event) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        galleryTrigger = item;
        showPhoto(index);
        dialog.showModal();
        document.body.classList.add('modal-open');
        dialog.querySelector('.photo-close').focus();
      });
    });
    dialog.querySelector('.photo-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.photo-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
    dialog.querySelector('.photo-next').addEventListener('click', () => showPhoto(photoIndex + 1));
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(photoIndex + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(photoIndex - 1); }
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      if (galleryTrigger) galleryTrigger.focus();
    });
  }

  let toastTimer;
  const notify = (message) => {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3500);
  };
  const copyButton = document.getElementById('copy-requisites');
  const legalText = [
    'Фонд поддержки и развития творческой молодежи «Арктика молодая»',
    'ОГРН: 1237700316182',
    'ИНН: 9717134710',
    'КПП: 771701001',
    'ОКПО: 53396274',
    'Юридический адрес: 129075, г. Москва, ул. Шереметьевская, д. 85, стр. 1, оф. 11',
    'Электронная почта: arctica-talant@mail.ru',
    'Руководитель: Лукина Виктория Борисовна'
  ].join('\n');
  const fallbackCopy = () => {
    const field = document.createElement('textarea');
    field.value = legalText;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '0';
    field.style.left = '-9999px';
    document.body.appendChild(field);
    field.select();
    field.setSelectionRange(0, field.value.length);
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
    field.remove();
    copyButton.focus();
    return copied;
  };
  copyButton.addEventListener('click', async () => {
    let copied = false;
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(legalText); copied = true; }
      catch (error) { copied = fallbackCopy(); }
    } else copied = fallbackCopy();
    notify(copied ? 'Реквизиты скопированы' : 'Выделите и скопируйте реквизиты из блока выше');
  });

  document.getElementById('year').textContent = String(new Date().getFullYear());
  document.body.classList.add('js-ready');
})();
