// Minimal client-side JS for The Forum That Ate Itself

document.addEventListener('DOMContentLoaded', function() {
  // Collapsible elements
  document.querySelectorAll('[data-collapse]').forEach(function(trigger) {
    trigger.addEventListener('click', function() {
      const target = document.getElementById(this.dataset.collapse);
      if (target) {
        target.style.display = target.style.display === 'none' ? 'block' : 'none';
      }
    });
  });

  // Confirm dangerous actions
  document.querySelectorAll('form[data-confirm]').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      if (!confirm(this.dataset.confirm)) {
        e.preventDefault();
      }
    });
  });

  // Auto-submit on select change (for user switching)
  document.querySelectorAll('select[data-autosubmit]').forEach(function(select) {
    select.addEventListener('change', function() {
      this.closest('form').submit();
    });
  });

  // Add confirmation to ban forms
  document.querySelectorAll('form[data-testid="form-ban-user"]').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      if (!confirm('Are you sure you want to ban this user? This action will be logged and may result in museum entry creation.')) {
        e.preventDefault();
      }
    });
  });

  // Random "server hiccup" message (for flavor)
  if (Math.random() < 0.05) {
    console.log('[SYSTEM] Database query optimized. 0.3ms saved.');
  }
  if (Math.random() < 0.02) {
    console.log('[SYSTEM] Moderation queue checked. All is well. Probably.');
  }
});
