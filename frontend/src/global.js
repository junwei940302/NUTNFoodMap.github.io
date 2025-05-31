// 檢查登入狀態並更新登入按鈕
function checkLoginStatus() {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;
    
    const loginStatus = sessionStorage.getItem('loginStatus');
    
    if (loginStatus === 'True') {
        loginBtn.textContent = '登出';
        
        // 移除之前可能添加的事件監聽器
        const newLoginBtn = loginBtn.cloneNode(true);
        loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
        
        // 添加登出功能
        newLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.removeItem('loginStatus');
            window.location.href = 'index.html';
        });
    }
}

// 當頁面加載完成時檢查登入狀態
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
});
