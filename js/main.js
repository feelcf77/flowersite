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
        package: form.querySelector('#package').value,
        note: form.querySelector('#note').value.trim(),
        time: new Date().toLocaleString('zh-CN')
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

      try {
        var orders = JSON.parse(localStorage.getItem('hhsj_orders') || '[]');
        orders.push(data);
        localStorage.setItem('hhsj_orders', JSON.stringify(orders));
      } catch (_) {}

      form.style.display = 'none';
      success.style.display = 'block';
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
