(function () {
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
        company: form.querySelector('#company').value.trim(),
        contactName: form.querySelector('#contactName').value.trim(),
        phone: form.querySelector('#phone').value.trim(),
        address: form.querySelector('#address').value.trim(),
        package: form.querySelector('#package').value || '未选',
        note: form.querySelector('#note').value.trim()
      };

      if (!data.company || !data.contactName || !data.phone) {
        alert('公司名称、联系人和手机号必填');
        btn.disabled = false;
        btn.textContent = '提交，等方案';
        return;
      }

      if (!/^1[3-9]\d{9}$/.test(data.phone)) {
        alert('手机号格式不对，检查一下');
        btn.disabled = false;
        btn.textContent = '提交，等方案';
        return;
      }

      // Post to Formspree
      var url = form.getAttribute('action');
      fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(function (res) {
        if (res.ok) {
          form.style.display = 'none';
          success.style.display = 'block';
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          return res.json().then(function (err) { throw err; });
        }
      })
      .catch(function () {
        alert('网络不太好，提交失败。请直接打 13368445881 或加微信。');
        btn.disabled = false;
        btn.textContent = '提交，等方案';
      });
    });
  }

  // ===== WeChat Float + QR Modal =====
  var floatBtn = document.getElementById('wxFloatBtn');
  var floatTip = document.getElementById('wxFloatTip');
  var qrModal = document.getElementById('qrModal');
  var qrClose = document.getElementById('qrModalClose');
  var qrMask = qrModal ? qrModal.querySelector('.qr-modal-mask') : null;

  if (floatBtn) {
    setTimeout(function () {
      floatTip.classList.add('show');
    }, 1200);
    setTimeout(function () {
      floatTip.classList.remove('show');
    }, 7000);

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

  if (qrClose) {
    qrClose.addEventListener('click', function () {
      qrModal.classList.remove('show');
    });
  }
  if (qrMask) {
    qrMask.addEventListener('click', function () {
      qrModal.classList.remove('show');
    });
  }

  document.addEventListener('click', function (e) {
    var target = e.target.closest('a[href="weixin://"]');
    if (target) {
      e.preventDefault();
      qrModal.classList.add('show');
    }
  });
})();
