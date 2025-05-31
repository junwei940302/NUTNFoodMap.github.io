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

// Add any about page specific functionality here
document.addEventListener('DOMContentLoaded', function() {
    // About page initialization code
});
