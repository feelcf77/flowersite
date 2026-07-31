(function () {
  'use strict';

  /* ==============================================
     FAQ Accordion — aria-controls + hidden sync
     ============================================== */
  var faqList = document.querySelector('.faq-list');
  if (faqList) {
    faqList.addEventListener('click', function (e) {
      var btn = e.target.closest('.faq-q');
      if (!btn) return;

      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      var panelId = btn.getAttribute('aria-controls');
      var panel = panelId ? document.getElementById(panelId) : null;

      // close all
      var allBtns = faqList.querySelectorAll('.faq-q');
      var allPanels = faqList.querySelectorAll('.faq-a');
      allBtns.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      allPanels.forEach(function (p) { p.hidden = true; });
      allBtns.forEach(function (b) {
        var item = b.closest('.faq-item');
        if (item) item.classList.remove('open');
      });

      // open clicked if it was closed
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        if (panel) panel.hidden = false;
        var item = btn.closest('.faq-item');
        if (item) item.classList.add('open');
      }
    });
  }

  /* ==============================================
     QR Modal — accessible dialog with focus trap
     ============================================== */
  var qrModal = document.getElementById('qrModal');
  var qrClose = document.getElementById('qrModalClose');
  var qrMask = qrModal ? qrModal.querySelector('.qr-modal-mask') : null;
  var lastFocus = null;

  function openModal() {
    if (!qrModal) return;
    lastFocus = document.activeElement;
    qrModal.hidden = false;
    qrModal.classList.add('show');
    // focus the close button
    if (qrClose) qrClose.focus();
    document.addEventListener('keydown', modalKeyHandler);
  }

  function closeModal() {
    if (!qrModal) return;
    qrModal.classList.remove('show');
    qrModal.hidden = true;
    document.removeEventListener('keydown', modalKeyHandler);
    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus();
      lastFocus = null;
    }
  }

  function modalKeyHandler(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key === 'Tab') {
      var body = qrModal.querySelector('.qr-modal-body');
      var focusable = body.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  if (qrClose) qrClose.addEventListener('click', closeModal);
  if (qrMask) qrMask.addEventListener('click', closeModal);

  /* ==============================================
     WeChat Float Button
     ============================================== */
  var floatBtn = document.getElementById('wxFloatBtn');
  var floatTip = document.getElementById('wxFloatTip');

  if (floatBtn) {
    floatBtn.addEventListener('click', openModal);
  }

  if (floatTip) {
    setTimeout(function () { floatTip.classList.add('show'); }, 1200);
    setTimeout(function () { floatTip.classList.remove('show'); }, 7000);
    floatTip.addEventListener('click', function (e) {
      e.stopPropagation();
      floatTip.classList.remove('show');
      openModal();
    });
  }

  // Header WeChat button
  var btnHeaderWechat = document.getElementById('btnWechatHeader');
  if (btnHeaderWechat) {
    btnHeaderWechat.addEventListener('click', openModal);
  }

  // Hero WeChat button
  var btnHeroWechat = document.getElementById('btnHeroWechat');
  if (btnHeroWechat) {
    btnHeroWechat.addEventListener('click', openModal);
  }

  /* ==============================================
     Order Form — client-side only, no remote send
     ============================================== */
  var form = document.getElementById('orderForm');
  var formResult = document.getElementById('formResult');
  var resultText = document.getElementById('resultText');
  var btnCopy = document.getElementById('btnCopy');
  var copyFeedback = document.getElementById('copyFeedback');

  function showFieldError(fieldId, msg) {
    var input = document.getElementById(fieldId);
    var errEl = document.getElementById('err-' + fieldId);
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (errEl) errEl.textContent = msg || '';
  }

  function clearAllErrors() {
    ['company', 'contactName', 'phone'].forEach(function (id) {
      showFieldError(id, '');
    });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAllErrors();

      var company = document.getElementById('company').value.trim();
      var contact = document.getElementById('contactName').value.trim();
      var phone = document.getElementById('phone').value.trim();
      var address = document.getElementById('address').value.trim();

      var valid = true;

      if (!company) {
        showFieldError('company', '请填写公司名称');
        valid = false;
      }
      if (!contact) {
        showFieldError('contactName', '请填写联系人');
        valid = false;
      }
      if (!phone) {
        showFieldError('phone', '请填写手机号');
        valid = false;
      } else if (!/^1[3-9]\d{9}$/.test(phone)) {
        showFieldError('phone', '手机号格式不对，请检查');
        valid = false;
      }

      if (!valid) {
        // focus first field with error
        var firstErr = document.querySelector('[aria-invalid="true"]');
        if (firstErr) firstErr.focus();
        return;
      }

      // Compose the request text
      var text = [
        '【企业绿植方案需求】',
        '公司：' + company,
        '联系人：' + contact,
        '手机：' + phone,
        '地址/需求：' + (address || '未填'),
        '生成时间：' + new Date().toLocaleString('zh-CN')
      ].join('\n');

      // Try clipboard first
      var copied = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          copied = true;
          showResult(text, true);
        }).catch(function () {
          showResult(text, false);
        });
      } else {
        // Fallback for older browsers or no clipboard API
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          copied = true;
        } catch (ex) {
          copied = false;
        }
        document.body.removeChild(ta);
        showResult(text, copied);
      }
    });
  }

  function showResult(text, copied) {
    form.style.display = 'none';
    formResult.hidden = false;
    if (resultText) resultText.value = text;
    formResult.focus();
    if (btnCopy) {
      btnCopy.onclick = function () {
        if (resultText) {
          resultText.select();
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(resultText.value).then(function () {
              if (copyFeedback) copyFeedback.textContent = '已复制到剪贴板';
            }).catch(function () {
              if (copyFeedback) copyFeedback.textContent = '请手动选中文本框内容复制';
            });
          } else {
            try {
              document.execCommand('copy');
              if (copyFeedback) copyFeedback.textContent = '已复制到剪贴板';
            } catch (ex) {
              if (copyFeedback) copyFeedback.textContent = '请手动选中文本框内容复制';
            }
          }
        }
      };
    }
    formResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Always open QR modal after generating
    setTimeout(function () { openModal(); }, 400);
  }

  /* ==============================================
     IntersectionObserver — fade-in reveal
     ============================================== */
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Show all immediately if prefers reduced motion
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ==============================================
     Smooth scroll for anchor links offset by header
     ============================================== */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var targetId = link.getAttribute('href').slice(1);
    if (!targetId) return;
    var target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();
    var header = document.getElementById('header');
    var offset = header ? header.offsetHeight + 8 : 8;
    var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: top, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

})();
