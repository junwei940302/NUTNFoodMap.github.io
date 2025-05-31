let generatedCode = '';

// Function to check if user is logged in before accessing the map
function checkMapAccess() {
    const loginStatus = sessionStorage.getItem('loginStatus');
    if (loginStatus === 'True') {
        // User is logged in, redirect to map
        window.location.href = 'map.html';
    } else {
        // User is not logged in, show alert and redirect to login page
        alert('請先登入以訪問美食地圖！');
        window.location.href = 'login.html';
    }
}

function generateRandomCode(length = 6) {
    let code = '';
    for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 10);
    }
    return code;
}

// 檢查登入狀態並更新登入按鈕
function checkLoginStatus() {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;
    
    const loginStatus = sessionStorage.getItem('loginStatus');
    
    if (loginStatus === 'True') {
        loginBtn.textContent = '登出';
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.removeItem('loginStatus');
            alert('已成功登出！');
            window.location.href = 'index.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // 檢查登入狀態
    checkLoginStatus();
    
    const inputs = document.querySelectorAll('#loginForm input[type="text"]');
    inputs.forEach((input, idx) => {
        input.addEventListener('input', function(e) {
            if (this.value.length === 1 && idx < inputs.length - 1) {
                inputs[idx + 1].focus();
            }
        });
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '' && idx > 0) {
                inputs[idx - 1].focus();
            }
        });
    });

    const validInputs = document.querySelectorAll('#validCodeForm input[type="text"]');
        validInputs.forEach((input, idx) => {
        input.addEventListener('input', function(e) {
            if (this.value.length === 1 && idx < validInputs.length - 1) {
                validInputs[idx + 1].focus();
            }
        });
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '' && idx > 0) {
                validInputs[idx - 1].focus();
            }
        });
    });

    // loginForm submit event
    const loginForm = document.getElementById('loginForm');
    const validCodeForm = document.getElementById('validCodeForm');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // 產生隨機 6 位驗證碼
        generatedCode = generateRandomCode(6);
        alert('驗證碼: ' + generatedCode);
        // 隱藏 loginForm，顯示 validCodeForm
        loginForm.style.display = 'none';
        validCodeForm.style.display = '';
        // 清空驗證碼輸入框
        validCodeForm.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
        // 聚焦第一格
        validCodeForm.querySelector('input[type="text"]').focus();
    });

    // validCodeForm 自動驗證
    validInputs.forEach((input, idx) => {
        input.addEventListener('input', function(e) {
            if (this.value.length === 1 && idx < validInputs.length - 1) {
                validInputs[idx + 1].focus();
            }
            // 自動驗證
            const code = Array.from(validInputs).map(i => i.value).join('');
            if (code.length === 6) {
                setTimeout(() => {
                    if (code === generatedCode) {
                        sessionStorage.setItem('loginStatus', 'True');
                        window.location.href = 'map.html';
                        // 這裡可以導向主頁或其他操作
                    } else {
                        alert('驗證碼錯誤，請重新輸入！');
                        validInputs.forEach(input => input.value = '');
                        validInputs[0].focus();
                    }
                }, 100); // 稍微延遲避免最後一格還沒顯示
            }
        });
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '' && idx > 0) {
                validInputs[idx - 1].focus();
            }
        });
    });
});
