let map;
let isPanelVisible = true;
let isMenuVisible = false; // Menu is folded by default
let currentlySelectedPanel = null;
let markers = {};
let currentOpenInfoWindow = null;

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

// 定義地標位置（移到全局範圍）
const NUTN = { lat: 22.98422, lng: 120.20781 };
const XMD = {lat: 22.98269, lng: 120.20492};
const DING = {lat: 22.98139, lng: 120.20895};
const KADOCHU = {lat: 22.98248, lng: 120.20425};
const MKK = {lat: 22.97970, lng: 120.21252};
const PIKE = {lat: 22.97406, lng: 120.21453};
const ML = {lat: 22.98395, lng: 120.21043};
const DALIN = {lat: 22.97598, lng: 120.21361};

// 存儲每個餐廳的菜單圖片URL
const menuImages = {
    "XMD": "https://picdn.gomaji.com/uploads/stores/782/219782/358105/小麵殿大灣店(菜單)_page-0001-20241024.jpg", // 小麵殿 The Noodle Palace
    "DING": "https://lh5.googleusercontent.com/p/AF1QipNs4KL-Pfw9Cghv4oxmF7_Jzw93xQct8VoIM7y_=w960", // 鼎 DING - 待補充URL
    "KADOCHU": "https://www.twtainan.net/content/images/shops/85263/1024x768_shops-image-cy3iampmy0iquarf1zoqkg.png", // 角鑄 KADOCHU - 待補充URL
    "MKK": "https://joyce8.com/wp-content/uploads/2024/05/麵匡匡菜單.jpg", // 麵匡匡 - 待補充URL
    "PIKE": "https://timmyblog.cc/wp-content/uploads/2021/08/20250123-wgd9j.jpg", // 派克雞排-大同店 - 待補充URL
    "ML": "https://scontent-hkg1-1.xx.fbcdn.net/v/t1.6435-9/154493751_267531208224712_3600088473877095951_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=GPGIbYaEFa4Q7kNvwFyri9i&_nc_oc=AdmLbujutmrbCd9z0ekYYfy3-5pMTse5w6h2TK9W7Jgx5j4Iie-IUg9Yk7EnQX6pCO3rSVnN_O97FKDQ0ycnAmO9&_nc_zt=23&_nc_ht=scontent-hkg1-1.xx&_nc_gid=J3I3qJXvmSiCAYni2Q1QDQ&oh=00_AfIZi3mL5_cCCnkm9eaRLf8b40Kos0_o63qWXdleMxkAGA&oe=6861793F", // 貓樂義大利麵 - 待補充URL
    "DALIN": "https://hululu.tw/wp-content/uploads/20231201111746_0.jpg" // 大林壽司株式會社 - 待補充URL
};

// Panel and Menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    // Panel toggle
    const toggleButton = document.getElementById('panel-toggle');
    const panelTrack = document.querySelector('.panel-track');
    
    if (toggleButton && panelTrack) {
        toggleButton.addEventListener('click', function() {
            // Toggle panel visibility
            isPanelVisible = !isPanelVisible;
            
            if (isPanelVisible) {
                // Show panel
                panelTrack.classList.remove('hidden');
                toggleButton.innerHTML = '<i class="fa-solid fa-download"></i>';
            } else {
                // Hide panel
                panelTrack.classList.add('hidden');
                toggleButton.innerHTML = '<i class="fa-solid fa-upload"></i>';
            }
        });
    }
    
    // Menu toggle
    const menuToggleButton = document.getElementById('menu-toggle');
    const menu = document.querySelector('.menu');
    
    if (menuToggleButton && menu) {
        menuToggleButton.addEventListener('click', function() {
            // Toggle menu visibility
            isMenuVisible = !isMenuVisible;
            
            if (isMenuVisible) {
                // Show menu
                menu.classList.remove('hidden');
                menuToggleButton.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
            } else {
                // Hide menu
                menu.classList.add('hidden');
                menuToggleButton.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
            }
        });
    }
    
    // Add click event listeners to panels after map is initialized
    window.addEventListener('load', function() {
        if (map) {
            const panels = document.querySelectorAll('.panel');
            
            // Map panel indices to marker positions
            const markerPositions = [
                XMD,      // 小麵殿 The Noodle Palace
                DING,     // 鼎 DING
                KADOCHU,  // 角鑄 KADOCHU
                MKK,      // 麵匡匡
                PIKE,     // 派克雞排-大同店
                ML,       // 貓樂義大利麵
                DALIN     // 大林壽司株式會社
            ];
            
            // Add click event listeners to each panel
            panels.forEach((panel, index) => {
                if (index < markerPositions.length) {
                    panel.addEventListener('click', function() {
                        focusPanel(panel, markerPositions[index]);
                    });
                }
            });
        }
    });
});

// Helper functions for panel focus
function focusPanel(panel, markerPosition) {
    // Remove focus from previously selected panel
    if (currentlySelectedPanel) {
        currentlySelectedPanel.style.color = '';
        currentlySelectedPanel.style.transform = '';
        currentlySelectedPanel.style.border = '1px solid white';
    }
    
    // Apply focus styling to the clicked panel
    panel.style.color = '#D87A33';
    panel.style.transform = 'translateY(-10px)';
    panel.style.border = '1px solid #D87A33';
    
    // Update the currently selected panel
    currentlySelectedPanel = panel;
    
    // Close any open info window
    if (currentOpenInfoWindow) {
        currentOpenInfoWindow.close();
    }
    
    // Center the map on the corresponding marker if a position is provided
    if (markerPosition && map) {
        map.panTo(markerPosition);
    }
    
    // 更新菜單圖片
    updateMenuImage(markerPosition);
    
    // Scroll the panel into view
    const panelTrack = document.querySelector('.panel-track');
    if (panelTrack) {
        // Calculate the panel's position relative to the panel-track
        const panelRect = panel.getBoundingClientRect();
        const trackRect = panelTrack.getBoundingClientRect();
        
        // Calculate the scroll position needed to center the panel in the visible area
        const scrollLeft = panel.offsetLeft - (trackRect.width / 2) + (panelRect.width / 2);
        
        // Smooth scroll to the panel
        panelTrack.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
        });
    }
}

// 根據選中的地標更新菜單圖片並添加折疊/展開動畫
function updateMenuImage(position) {
    const menu = document.querySelector('.menu');
    const menuImg = document.querySelector('.menu img');
    const menuToggleButton = document.getElementById('menu-toggle');
    
    if (!menuImg || !menu || !menuToggleButton) return;
    
    // 根據位置判斷是哪個餐廳
    let restaurantKey = '';
    
    // 使用經緯度比較而不是直接比較對象
    if (position && position.lat && position.lng) {
        if (Math.abs(position.lat - XMD.lat) < 0.0001 && Math.abs(position.lng - XMD.lng) < 0.0001) {
            restaurantKey = 'XMD';
        } else if (Math.abs(position.lat - DING.lat) < 0.0001 && Math.abs(position.lng - DING.lng) < 0.0001) {
            restaurantKey = 'DING';
        } else if (Math.abs(position.lat - KADOCHU.lat) < 0.0001 && Math.abs(position.lng - KADOCHU.lng) < 0.0001) {
            restaurantKey = 'KADOCHU';
        } else if (Math.abs(position.lat - MKK.lat) < 0.0001 && Math.abs(position.lng - MKK.lng) < 0.0001) {
            restaurantKey = 'MKK';
        } else if (Math.abs(position.lat - PIKE.lat) < 0.0001 && Math.abs(position.lng - PIKE.lng) < 0.0001) {
            restaurantKey = 'PIKE';
        } else if (Math.abs(position.lat - ML.lat) < 0.0001 && Math.abs(position.lng - ML.lng) < 0.0001) {
            restaurantKey = 'ML';
        } else if (Math.abs(position.lat - DALIN.lat) < 0.0001 && Math.abs(position.lng - DALIN.lng) < 0.0001) {
            restaurantKey = 'DALIN';
        }
    }
    
    console.log("更新菜單圖片，餐廳：", restaurantKey);
    
    // 如果有對應的菜單圖片URL，則更新圖片並添加折疊/展開動畫
    if (restaurantKey && menuImages[restaurantKey]) {
        // 先折疊菜單
        menu.classList.add('hidden');
        menuToggleButton.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        isMenuVisible = false;
        
        // 設置一個短暫的延遲，讓折疊動畫完成
        setTimeout(() => {
            // 更新圖片
            console.log("設置菜單圖片URL：", menuImages[restaurantKey]);
            menuImg.src = menuImages[restaurantKey];
            
            // 再次延遲，確保圖片已加載
            setTimeout(() => {
                // 展開菜單
                menu.classList.remove('hidden');
                menuToggleButton.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
                isMenuVisible = true;
            }, 500); // 500毫秒後展開
        }, 500); // 500毫秒後更新圖片
    }
}

function initMap() {

map = new google.maps.Map(document.getElementById("map"), {
    zoom: 18,
    center: XMD,
    mapTypeId: "roadmap",
});

const NUTNIcon = {
    url: "https://tue.utaipei.edu.tw/var/file/17/1017/img/64/54215876.png",
    scaledSize: new google.maps.Size(50, 50),
};
const NUTNmarker = new google.maps.Marker({
    position: NUTN,
    map: map,
    title: "國立臺南大學 National University of Tainan",
    icon: NUTNIcon,
});
const NUTNinfoWindow = new google.maps.InfoWindow({
    content: "<h3>國立臺南大學 National University of Tainan</h3><p>學校</p>",
});
NUTNmarker.addListener("click", () => {
    // Close the previously open info window if there is one
    if (currentOpenInfoWindow) {
        currentOpenInfoWindow.close();
    }
    
    // Open this info window and update the current open info window
    NUTNinfoWindow.open(map, NUTNmarker);
    currentOpenInfoWindow = NUTNinfoWindow;
});


const XMDIcon = {
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQP6lgxP-jb94nQhrOVArOU7d2dmaOFXDZwOw&s",
    scaledSize: new google.maps.Size(50, 50),
};
const XMDmarker = new google.maps.Marker({
    position: XMD,
    map: map,
    title: "小麵殿 The Noodle Palace",
    icon: XMDIcon,
});
const XMDinfoWindow = new google.maps.InfoWindow({
    content: "<h3>小麵殿 The Noodle Palace</h3><p>餐廳</p>",
});
XMDmarker.addListener("click", () => {
    // Close the previously open info window if there is one
    if (currentOpenInfoWindow) {
        currentOpenInfoWindow.close();
    }
    
    // Open this info window and update the current open info window
    XMDinfoWindow.open(map, XMDmarker);
    currentOpenInfoWindow = XMDinfoWindow;
    
    // Focus the corresponding panel (index 0)
    const panels = document.querySelectorAll('.panel');
    if (panels.length > 0) {
        focusPanel(panels[0], XMD);
    }
});

const DINGIcon = {
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5gNIP0Dz2OeFl0ew6wV_FRBApIVbS5BT7qg&s",
    scaledSize: new google.maps.Size(50, 50),
};
const DINGmarker = new google.maps.Marker({
    position: DING,
    map: map,
    title: "鼎 DING",
    icon: DINGIcon,
});
const DINGinfoWindow = new google.maps.InfoWindow({
    content: "<h3>鼎 DING</h3><p>餐廳</p>",
});
DINGmarker.addListener("click", () => {
    // Close the previously open info window if there is one
    if (currentOpenInfoWindow) {
        currentOpenInfoWindow.close();
    }
    
    // Open this info window and update the current open info window
    DINGinfoWindow.open(map, DINGmarker);
    currentOpenInfoWindow = DINGinfoWindow;
    
    // Focus the corresponding panel (index 1)
    const panels = document.querySelectorAll('.panel');
    if (panels.length > 1) {
        focusPanel(panels[1], DING);
    }
});

const KADOCHUIcon = {
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNq8i6IawvUNs0ykw2z5qiB7t-hIP5V4lBeA&s",
    scaledSize: new google.maps.Size(50, 50),
};
const KADOCHUmarker = new google.maps.Marker({
    position: KADOCHU,
    map: map,
    title: "角鑄 KADOCHU",
    icon: KADOCHUIcon,
});
const KADOCHUinfoWindow = new google.maps.InfoWindow({
    content: "<h3>角鑄 KADOCHU</h3><p>餐廳</p>",
});
KADOCHUmarker.addListener("click", () => {
    // Close the previously open info window if there is one
    if (currentOpenInfoWindow) {
        currentOpenInfoWindow.close();
    }
    
    // Open this info window and update the current open info window
    KADOCHUinfoWindow.open(map, KADOCHUmarker);
    currentOpenInfoWindow = KADOCHUinfoWindow;
    
    // Focus the corresponding panel (index 2)
    const panels = document.querySelectorAll('.panel');
    if (panels.length > 2) {
        focusPanel(panels[2], KADOCHU);
    }
});

const MKKIcon = {
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBZQJ3qlBHERxr6rbv2PuwStVQ2oYA76MU8Q&s",
    scaledSize: new google.maps.Size(50, 50),
};
const MKKmarker = new google.maps.Marker({
    position: MKK,
    map: map,
    title: "麵匡匡",
    icon: MKKIcon,
});
const MKKinfoWindow = new google.maps.InfoWindow({
    content: "<h3>麵匡匡</h3><p>餐廳</p>",
});
MKKmarker.addListener("click", () => {
    // Close the previously open info window if there is one
    if (currentOpenInfoWindow) {
        currentOpenInfoWindow.close();
    }
    
    // Open this info window and update the current open info window
    MKKinfoWindow.open(map, MKKmarker);
    currentOpenInfoWindow = MKKinfoWindow;
    
    // Focus the corresponding panel (index 3)
    const panels = document.querySelectorAll('.panel');
    if (panels.length > 3) {
        focusPanel(panels[3], MKK);
    }
});

const PIKEIcon = {
    url: "https://food-safetyws.tycg.gov.tw/001/Upload/0/f04387e4-3237-ec11-a1fc-005056b7f485/e59a9fef-5c08-4bdd-a8f6-49ebba3c6b7a.png",
    scaledSize: new google.maps.Size(50, 50),
};
const PIKEmarker = new google.maps.Marker({
    position: PIKE,
    map: map,
    title: "派克雞排-大同店",
    icon: PIKEIcon,
});
const PIKEinfoWindow = new google.maps.InfoWindow({
    content: "<h3>派克雞排-大同店</h3><p>餐廳</p>",
});
PIKEmarker.addListener("click", () => {
    // Close the previously open info window if there is one
    if (currentOpenInfoWindow) {
        currentOpenInfoWindow.close();
    }
    
    // Open this info window and update the current open info window
    PIKEinfoWindow.open(map, PIKEmarker);
    currentOpenInfoWindow = PIKEinfoWindow;
    
    // Focus the corresponding panel (index 4)
    const panels = document.querySelectorAll('.panel');
    if (panels.length > 4) {
        focusPanel(panels[4], PIKE);
    }
});

const MLIcon = {
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLR0s4M8do_Dv9HfigEwLeulctHd2XuHtgmQ&s",
    scaledSize: new google.maps.Size(50, 50),
};
const MLmarker = new google.maps.Marker({
    position: ML,
    map: map,
    title: "貓樂義大利麵",
    icon: MLIcon,
});
const MLinfoWindow = new google.maps.InfoWindow({
    content: "<h3>貓樂義大利麵</h3><p>餐廳</p>",
});
MLmarker.addListener("click", () => {
    // Close the previously open info window if there is one
    if (currentOpenInfoWindow) {
        currentOpenInfoWindow.close();
    }
    
    // Open this info window and update the current open info window
    MLinfoWindow.open(map, MLmarker);
    currentOpenInfoWindow = MLinfoWindow;
    
    // Focus the corresponding panel (index 5)
    const panels = document.querySelectorAll('.panel');
    if (panels.length > 5) {
        focusPanel(panels[5], ML);
    }
});

const DALINIcon = {
    url: "https://static.104.com.tw/b_profile/cust_picture/1138/130000000251138/logo.jpg?v=20250421162459",
    scaledSize: new google.maps.Size(100, 50),
};
const DALINmarker = new google.maps.Marker({
    position: DALIN,
    map: map,
    title: "大林壽司株式會社",
    icon: DALINIcon,
});
const DALINinfoWindow = new google.maps.InfoWindow({
    content: "<h3>大林壽司株式會社</h3><p>餐廳</p>",
});
DALINmarker.addListener("click", () => {
    // Close the previously open info window if there is one
    if (currentOpenInfoWindow) {
        currentOpenInfoWindow.close();
    }
    
    // Open this info window and update the current open info window
    DALINinfoWindow.open(map, DALINmarker);
    currentOpenInfoWindow = DALINinfoWindow;
    
    // Focus the corresponding panel (index 6)
    const panels = document.querySelectorAll('.panel');
    if (panels.length > 6) {
        focusPanel(panels[6], DALIN);
    }
});

/*
// 載入 GeoJSON 範圍
map.data.loadGeoJson('https://raw.githubusercontent.com/junwei940302/NUTNFoodMap/refs/heads/main/MapBound.geojson', null, function(features) {
    const bounds = new google.maps.LatLngBounds();
    features.forEach(feature => {
    processPoints(feature.getGeometry(), bounds.extend, bounds);
    });

    // 限制互動範圍
    map.setOptions({
    restriction: {
        latLngBounds: bounds,
        strictBounds: true,
    },
    });

    // 調整地圖初始顯示為 GeoJSON 邊界
    map.fitBounds(bounds);
});

// GeoJSON 可視化樣式
map.data.setStyle({
    fillColor: 'red',
    fillOpacity: 0.15,
    strokeColor: 'red',
    strokeWeight: 3
});
}

// GeoJSON 幾何處理工具函數
function processPoints(geometry, callback, thisArg) {
if (geometry instanceof google.maps.Data.Point) {
    callback.call(thisArg, geometry.get());
} else if (
    geometry instanceof google.maps.Data.MultiPoint ||
    geometry instanceof google.maps.Data.LineString ||
    geometry instanceof google.maps.Data.LinearRing
) {
    geometry.getArray().forEach(g => callback.call(thisArg, g));
} else if (
    geometry instanceof google.maps.Data.Polygon ||
    geometry instanceof google.maps.Data.MultiLineString
) {
    geometry.getArray().forEach(g => processPoints(g, callback, thisArg));
} else if (geometry instanceof google.maps.Data.MultiPolygon) {
    geometry.getArray().forEach(g => processPoints(g, callback, thisArg));
}
*/
}
