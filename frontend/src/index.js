window.addEventListener('scroll', () => {
    const section = document.querySelector('.section');
    const homeImg = document.getElementById('home-img');
    if (!section || !homeImg) return;
  
    // section 到視窗頂部的距離
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    // 頁面已經滾動的距離
    const scrollY = window.scrollY;
  
    // 設定最大平移距離（section 到頂部時為最大）
    const maxTranslate = 0.35;
    // 設定觸發平移的最大滾動距離（section 到頂部）
    const maxScroll = sectionTop;
  
    // 計算目前應該平移多少
    let percent = Math.min(scrollY / maxScroll, 1) * maxTranslate;
  
    // 保持旋轉動畫，同時應用 translateX
    const currentTime = Date.now() / 1000; // 當前時間（秒）
    const rotationDegree = (currentTime % 60) * 6; // 60秒旋轉360度，每秒6度
    
    // 應用 translateY(-50%)、translateX 和 rotate
    homeImg.style.transform = `translateY(-50%) rotate(${rotationDegree}deg)`;
    homeImg.style.left = `${percent * 100 +65}%`;
});

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

// Carousel functionality
document.addEventListener('DOMContentLoaded', () => {
    const carouselTrack = document.querySelector('.carousel-track');
    
    // Function to handle the carousel animation reset
    function handleCarouselAnimation() {
        if (!carouselTrack) return;
        
        // When the animation completes, reset the position without animation
        carouselTrack.addEventListener('animationiteration', () => {
            // The CSS animation will handle the looping automatically
            // This is just a fallback in case we need additional logic
        });
    }
    
    handleCarouselAnimation();
});
