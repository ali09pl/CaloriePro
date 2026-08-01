// =========================================================
// SERVICE WORKER REGISTRATION
// =========================================================
(function(){
  'use strict';
  if(!('serviceWorker' in navigator)) return;

  window.addEventListener('load', function(){
    navigator.serviceWorker.register('/sw.js').then(function(reg){
      reg.addEventListener('updatefound', function(){
        const newWorker = reg.installing;
        if(!newWorker) return;
        newWorker.addEventListener('statechange', function(){
          if(newWorker.state === 'installed' && navigator.serviceWorker.controller){
            if(typeof showToast === 'function'){
              showToast('🔄','Update available','Refresh to get the latest version.','ac');
            }
          }
        });
      });
    }).catch(function(err){
      console.warn('[CaloriePro] SW registration failed:', err);
    });
  });
})();
