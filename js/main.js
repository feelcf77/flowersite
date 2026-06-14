(function () {
  /* ==============================================
     NOTE — SendKey 暴露在前端代码中。
     正式上线建议通过 Cloudflare Worker / 腾讯云函数
     做一层代理转发，避免 key 被滥用。
  ============================================== */
  var SENDKEY = 'SCT361668TypM6Fz69RRhcB9vXvl1fXJsn';

  // ===== FAQ Accordion =====
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      // close all
      faqItems.forEach(function (el) {
        el.classList.remove('open');
        var q = el.querySelector('.faq-q');
        if (q) q.setAttribute('aria-expanded', 'false');
      });
      // open current (unless it was already open)
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ===== Order Form =====
  var form = document.getElementById('orderForm');
  var success = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('.btn-submit');
      btn.disabled = true;
      btn.textContent = '提交中……';

      var data = {
        company:  form.querySelector('#company').value.trim(),
        contact:  form.querySelector('#contactName').value.trim(),
        phone:    form.querySelector('#phone').value.trim(),
        address:  form.querySelector('#address').value.trim()
      };

      if (!data.company || !data.contact || !data.phone) {
        alert('公司名称、联系人和手机号必填');
        btn.disabled = false;
        btn.textContent = '提交，30 分钟内回复';
        return;
      }

      if (!/^1[3-9]\d{9}$/.test(data.phone)) {
        alert('手机号格式不对，检查一下');
        btn.disabled = false;
        btn.textContent = '提交，30 分钟内回复';
        return;
      }

      var title = '新询价：' + data.company;
      var desp = [
        '**公司**：' + data.company,
        '**联系人**：' + data.contact,
        '**手机**：' + data.phone,
        '**地址/需求**：' + (data.address || '未填'),
        '',
        '---',
        '[' + new Date().toLocaleString('zh-CN') + ']'
      ].join('\n\n');

      var url = 'https://sctapi.ftqq.com/' + SENDKEY + '.send';
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title, desp: desp })
      })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        if (json.code === 0) {
          form.style.display = 'none';
          success.style.display = 'block';
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          throw new Error(json.info || '发送失败');
        }
      })
      .catch(function () {
        alert('网络不太稳定，提交失败。请直接致电 13368445881 或加微信。');
        btn.disabled = false;
        btn.textContent = '提交，30 分钟内回复';
      });
    });
  }

  // ===== WeChat Float + QR Modal =====
  var floatBtn = document.getElementById('wxFloatBtn');
  var floatTip = document.getElementById('wxFloatTip');
  var qrModal  = document.getElementById('qrModal');
  var qrClose  = document.getElementById('qrModalClose');
  var qrMask   = qrModal ? qrModal.querySelector('.qr-modal-mask') : null;

  if (floatBtn) {
    setTimeout(function () { floatTip.classList.add('show'); }, 1200);
    setTimeout(function () { floatTip.classList.remove('show'); }, 7000);

    floatBtn.addEventListener('click', function () {
      floatTip.classList.remove('show');
      qrModal.classList.add('show');
    });
  }

  if (floatTip) {
    floatTip.addEventListener('click', function (e) {
      e.stopPropagation();
      floatTip.classList.remove('show');
      qrModal.classList.add('show');
    });
  }

  if (qrClose) qrClose.addEventListener('click', function () { qrModal.classList.remove('show'); });
  if (qrMask)  qrMask.addEventListener('click',  function () { qrModal.classList.remove('show'); });

  document.addEventListener('click', function (e) {
    var t = e.target.closest('a[href="weixin://"]');
    if (t) { e.preventDefault(); qrModal.classList.add('show'); }
  });
})();
