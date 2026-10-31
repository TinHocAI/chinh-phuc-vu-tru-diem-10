/**
 * Chinh Phục Vũ Trụ Điểm 10 - Main Application Logic
 * CLB AI & Năng Lực Số - THPT Bộc Bố
 */

const API_BASE = window.location.origin;

const APP_STATE = {
  currentScreen: 'onboarding',
  user: null,
  galaxies: [],
  selectedGrade: '11',
  selectedSubject: 'Toán Học',
  isPlayMode: false,
  activeGalaxyId: null,
  activeStation: null,
  countdownSec: 30,
  countdownTimer: null,
  selectedAvatar: 'boy_astronaut',
  dialogueStep: 0,
  npcDialogues: [
    "🚀 Chào mừng Phi hành gia đến với không gian THPT Bộc Bố! Năng lượng tri thức của toàn trường đang cần bạn đánh thức.",
    "⚡ Hãy nạp tài liệu đề cương các môn vào 'Lò Phản Ứng Dữ Liệu' để AI tự động phân tích và gieo thành các chòm sao câu hỏi trên Bản đồ Anti-gravity.",
    "🪐 Khám phá từng Trạm không gian, trả lời đúng để nhận EXP và nạp đầy bình Oxy! Nếu gặp bế tắc, hãy bấm nút 'Gọi cứu viện AI' nhé!"
  ]
};

const SUBJECT_CATALOG = [
  { code: 'Toán Học', name: 'Toán Học', icon: '📐' },
  { code: 'Vật Lý', name: 'Vật Lý', icon: '⚡' },
  { code: 'Hóa Học', name: 'Hóa Học', icon: '🧪' },
  { code: 'Sinh Học', name: 'Sinh Học', icon: '🧬' },
  { code: 'Tin Học', name: 'Tin Học', icon: '💻' },
  { code: 'Lịch Sử', name: 'Lịch Sử', icon: '📜' },
  { code: 'Địa Lý', name: 'Địa Lý', icon: '🌍' },
  { code: 'Ngữ Văn', name: 'Ngữ Văn', icon: '📖' },
  { code: 'Tiếng Anh', name: 'Tiếng Anh', icon: '🌐' }
];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadUserData();
  await loadGalaxies();

  // Kiểm tra nếu người dùng đã hoàn thành onboarding trước đó
  if (APP_STATE.user && APP_STATE.user.name && localStorage.getItem('onboarding_done')) {
    switchScreen('hub');
  } else {
    switchScreen('onboarding');
    renderDialogueStep();
  }
});

// --- API COMMUNICATIONS ---
async function apiRequest(endpoint, method = 'GET', data = null) {
  try {
    const options = { method, headers: {} };
    if (data && !(data instanceof FormData)) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    } else if (data instanceof FormData) {
      options.body = data;
    }
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Lỗi máy chủ' }));
      throw new Error(err.detail || 'Lỗi kết nối máy chủ');
    }
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

async function loadUserData() {
  try {
    const user = await apiRequest('/api/user');
    APP_STATE.user = user;
    updateTopHUD();
  } catch (e) {
    console.warn('Không tải được user, dùng dữ liệu mặc định');
  }
}

async function loadGalaxies() {
  try {
    const galaxies = await apiRequest('/api/galaxies');
    APP_STATE.galaxies = galaxies;
    if (galaxies.length > 0 && !APP_STATE.activeGalaxyId) {
      APP_STATE.activeGalaxyId = galaxies[0].id;
    }
  } catch (e) {
    console.warn('Lỗi tải danh sách hệ sao:', e);
  }
}

// --- SCREEN SWITCHING ---
function switchScreen(screenId) {
  window.soundEngine.click();
  document.querySelectorAll('.app-screen').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(`screen-${screenId}`);
  if (target) {
    target.classList.add('active');
    APP_STATE.currentScreen = screenId;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (screenId === 'hub') renderMainHub();
    if (screenId === 'map') renderSpaceMap();
    if (screenId === 'leaderboard') renderLeaderboard();
  }
}

// --- TOP HUD UPDATES ---
function updateTopHUD() {
  if (!APP_STATE.user) return;
  const u = APP_STATE.user;

  document.getElementById('hud-user-name').textContent = u.name;
  document.getElementById('hud-ship-name').textContent = u.ship_name;
  document.getElementById('hud-level').textContent = `Lv.${u.level}`;
  document.getElementById('hud-streak-count').textContent = u.streak;

  const oxyFill = document.getElementById('hud-oxy-fill');
  const oxyText = document.getElementById('hud-oxy-text');
  oxyFill.style.width = `${u.oxy}%`;
  oxyText.textContent = `${u.oxy}%`;

  if (u.oxy <= 25) {
    oxyFill.classList.add('oxy-low');
  } else {
    oxyFill.classList.remove('oxy-low');
  }

  const avatarDisplay = document.getElementById('hud-avatar-icon');
  avatarDisplay.textContent = u.avatar === 'girl_astronaut' ? '👩‍🚀' : '👨‍🚀';
}

// --- ONBOARDING STAGE ---
function renderDialogueStep() {
  const textEl = document.getElementById('npc-dialogue-text');
  const stepEl = document.getElementById('npc-step-badge');
  const nextBtn = document.getElementById('npc-next-btn');

  textEl.textContent = APP_STATE.npcDialogues[APP_STATE.dialogueStep];
  stepEl.textContent = `Bước ${APP_STATE.dialogueStep + 1}/3`;

  if (APP_STATE.dialogueStep === APP_STATE.npcDialogues.length - 1) {
    nextBtn.textContent = 'Bắt Đầu Ngay 🚀';
  } else {
    nextBtn.textContent = 'Tiếp Tục ➜';
  }
}

function nextDialogueStep() {
  window.soundEngine.click();
  if (APP_STATE.dialogueStep < APP_STATE.npcDialogues.length - 1) {
    APP_STATE.dialogueStep++;
    renderDialogueStep();
  } else {
    // Hoàn tất 3 lời thoại, chuyển sang chọn định danh
    document.getElementById('onboarding-dialogue-wrap').style.display = 'none';
    document.getElementById('onboarding-identity-wrap').style.display = 'block';
  }
}

function selectAvatar(avatarType) {
  window.soundEngine.click();
  APP_STATE.selectedAvatar = avatarType;
  document.querySelectorAll('.avatar-choice-card').forEach(c => c.classList.remove('selected'));
  const card = document.getElementById(`avatar-card-${avatarType}`);
  if (card) card.classList.add('selected');
}

async function finishOnboarding() {
  window.soundEngine.warp();
  const shipName = document.getElementById('input-ship-name').value.trim() || 'Sao Băng Bộc Bố 01';
  const studentName = document.getElementById('input-student-name').value.trim() || 'Nguyễn Văn An';
  const ssoProvider = document.getElementById('select-sso').value;

  try {
    await apiRequest('/api/user/login', 'POST', {
      sso_provider: ssoProvider,
      student_name: studentName,
      class_name: '10A1'
    });

    await apiRequest('/api/user/profile', 'POST', {
      avatar: APP_STATE.selectedAvatar,
      ship_name: shipName
    });

    localStorage.setItem('onboarding_done', 'true');
    await loadUserData();
    switchScreen('hub');
  } catch (e) {
    alert('Không thể lưu thông tin: ' + e.message);
  }
}

// --- MAIN HUB STAGE ---
function renderMainHub() {
  updateTopHUD();
  const u = APP_STATE.user;
  document.getElementById('hub-greeting-name').textContent = u.name;
  document.getElementById('hub-ship-callsign').textContent = `Phi thuyền: ${u.ship_name}`;
  document.getElementById('hub-exp-progress').textContent = `${u.exp} / ${u.exp_to_next} EXP`;
  
  const expBar = document.getElementById('hub-exp-bar-fill');
  const pct = Math.min(100, Math.round((u.exp / u.exp_to_next) * 100));
  expBar.style.width = `${pct}%`;

  document.getElementById('hub-galaxies-count').textContent = APP_STATE.galaxies.length;
}

// --- REACTOR (LÒ PHẢN ỨNG) STAGE ---
function loadSampleDoc(sampleType) {
  window.soundEngine.click();
  let text = '';
  let filename = '';
  let subject = '';

  if (sampleType === 'history') {
    filename = 'De_cuong_Lich_Su_10_Dien_Bien_Phu.txt';
    subject = 'Lịch Sử 10';
    text = `ĐỀ CƯƠNG ÔN TẬP LỊCH SỬ 10 - CHIẾN DỊCH ĐIỆN BIÊN PHỦ 1954
I. Bối cảnh và Chủ trương:
- Tháng 12/1953, Bộ Chính trị Trung ương Đảng họp tại Tỉn Keo (Định Hóa, Thái Nguyên) quyết định mở chiến dịch Điện Biên Phủ.
- Mục tiêu: Tiêu diệt tập đoàn cứ điểm mạnh nhất Đông Dương của thực dân Pháp.
- Đại tướng Võ Nguyên Giáp được giao trọng trách Tư lệnh kiêm Bí thư Đảng ủy chiến dịch.
II. Diễn biến 3 đợt:
- Đợt 1 (13/3 - 17/3/1954): Tấn công tiêu diệt cứ điểm Him Lam và Độc Lập.
- Đợt 2 (30/3 - 26/4/1954): Đánh chiếm các ngọn đồi phía đông phân khu trung tâm (Đồi A1, C1).
- Đợt 3 (1/5 - 7/5/1954): Tổng công kích tiêu diệt toàn bộ quân Pháp, bắt sống tướng De Castries.
III. Ý nghĩa lịch sử:
- "Lừng lẫy năm châu, chấn động địa cầu", kết thúc thắng lợi cuộc kháng chiến chống Pháp.`;
    processTextDocument(filename, text, subject, '10', 'Lịch Sử');
  } else if (sampleType === 'cs') {
    filename = 'De_cuong_Tin_Hoc_10_Thuat_Toan_Python.txt';
    subject = 'Tin Học 10';
    text = `ĐỀ CƯƠNG ÔN TẬP TIN HỌC 10 - THUẬT TOÁN VÀ CÂU LỆNH ĐIỀU KIỆN
1. Khái niệm Thuật toán: Dãy các thao tác xác định nhằm biến đổi Input thành Output.
2. Cấu trúc rẽ nhánh if - else trong Python:
   - Dạng thiếu: if <điều_kiện>: <khối_lệnh>
   - Dạng đủ: if <điều_kiện>: <khối_lệnh_1> else: <khối_lệnh_2>
3. Vòng lặp for và while:
   - range(n) sinh dãy từ 0 đến n-1.
   - Vòng lặp while lặp lại khi điều kiện còn đúng.`;
    processTextDocument(filename, text, subject, '10', 'Tin Học');
  } else {
    filename = 'De_cuong_Vat_Ly_10_Dinh_Luat_Newton.txt';
    subject = 'Vật Lý 10';
    text = `ĐỀ CƯƠNG VẬT LÝ 10 - BA ĐỊNH LUẬT NEWTON
1. Định luật I Newton: Quán tính - Vật giữ nguyên trạng thái đứng yên hoặc chuyển động thẳng đều nếu không chịu lực tác dụng hoặc tổng hợp lực bằng 0.
2. Định luật II Newton: Gia tốc a = F / m. Véc tơ gia tốc cùng hướng với lực tác dụng.
3. Định luật III Newton: Trong mọi tương tác, hai lực xuất hiện đồng thời, cùng độ lớn, ngược chiều (lực và phản lực).`;
    processTextDocument(filename, text, subject, '10', 'Vật Lý');
  }
}

async function handleFileUpload(file) {
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('subject', document.getElementById('reactor-custom-subject').value || 'Chuyên Đề 10');
  
  const gradeSelect = document.getElementById('reactor-grade');
  const subjectSelect = document.getElementById('reactor-subject-code');
  if (gradeSelect) formData.append('grade', gradeSelect.value);
  if (subjectSelect) formData.append('subject_code', subjectSelect.value);

  const apiKey = document.getElementById('reactor-api-key').value.trim();
  if (apiKey) formData.append('api_key', apiKey);

  await triggerReactorSynthesis(formData);
}

async function processTextDocument(filename, text, subject, grade = "10", subjectCode = "Lịch Sử") {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const file = new File([blob], filename, { type: 'text/plain' });
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('subject', subject);
  formData.append('grade', grade);
  formData.append('subject_code', subjectCode);
  
  const apiKey = document.getElementById('reactor-api-key').value.trim();
  if (apiKey) formData.append('api_key', apiKey);

  await triggerReactorSynthesis(formData);
}

async function triggerReactorSynthesis(formData) {
  const loadingOverlay = document.getElementById('reactor-loading');
  const statusText = document.getElementById('reactor-status-msg');
  loadingOverlay.style.display = 'flex';
  statusText.textContent = 'Lò Phản Ứng đang quét tài liệu và kết nối Gemini AI...';
  window.soundEngine.warp();

  try {
    const res = await apiRequest('/api/reactor/upload', 'POST', formData);
    statusText.textContent = 'AI đã phân loại 4 cấp độ và gieo Chòm Sao mới thành công!';
    window.soundEngine.correct();

    await loadGalaxies();
    APP_STATE.activeGalaxyId = res.galaxy.id;
    APP_STATE.selectedGrade = res.galaxy.grade || '10';
    APP_STATE.selectedSubject = res.galaxy.subject_code || 'Lịch Sử';

    setTimeout(() => {
      loadingOverlay.style.display = 'none';
      switchScreen('map');
      enterGalaxyStage(res.galaxy.id);
    }, 1200);
  } catch (err) {
    loadingOverlay.style.display = 'none';
    alert('Lỗi kích hoạt Lò Phản Ứng: ' + err.message);
  }
}

// --- SPACE MAP (ROUTING & ANTI-GRAVITY STAGE) ---

function renderSpaceMap() {
  if (APP_STATE.isPlayMode && APP_STATE.activeGalaxyId) {
    document.getElementById('map-route-portal').style.display = 'none';
    document.getElementById('map-play-stage').style.display = 'block';
    renderAntiGravityStage();
  } else {
    document.getElementById('map-route-portal').style.display = 'block';
    document.getElementById('map-play-stage').style.display = 'none';
    renderRouteSelectionPortal();
  }
}

function selectGrade(grade) {
  window.soundEngine.click();
  APP_STATE.selectedGrade = grade;
  
  document.querySelectorAll('.grade-pill-card').forEach(c => c.classList.remove('active'));
  const card = document.getElementById(`grade-pill-${grade}`);
  if (card) card.classList.add('active');

  renderRouteSelectionPortal();
}

function selectSubject(subjectCode) {
  window.soundEngine.click();
  APP_STATE.selectedSubject = subjectCode;
  renderRouteSelectionPortal();
}

function returnToRouteSelection() {
  window.soundEngine.click();
  APP_STATE.isPlayMode = false;
  document.getElementById('map-route-portal').style.display = 'block';
  document.getElementById('map-play-stage').style.display = 'none';
  renderRouteSelectionPortal();
}

function enterGalaxyStage(galaxyId) {
  window.soundEngine.warp();
  APP_STATE.activeGalaxyId = galaxyId;
  APP_STATE.isPlayMode = true;

  document.getElementById('map-route-portal').style.display = 'none';
  document.getElementById('map-play-stage').style.display = 'block';
  renderAntiGravityStage();
}

function renderRouteSelectionPortal() {
  // Update Grade pills active state
  document.querySelectorAll('.grade-pill-card').forEach(c => c.classList.remove('active'));
  const activeGradeCard = document.getElementById(`grade-pill-${APP_STATE.selectedGrade}`);
  if (activeGradeCard) activeGradeCard.classList.add('active');

  // Render Subjects Grid
  const subjectsContainer = document.getElementById('subjects-container');
  subjectsContainer.innerHTML = '';

  SUBJECT_CATALOG.forEach(sub => {
    // Count how many galaxies belong to this grade & subject
    const count = APP_STATE.galaxies.filter(g => 
      (g.grade === APP_STATE.selectedGrade || (!g.grade && APP_STATE.selectedGrade === '10')) && 
      (g.subject_code === sub.code || (g.subject && g.subject.includes(sub.code)))
    ).length;

    const card = document.createElement('div');
    const isSelected = (sub.code === APP_STATE.selectedSubject);
    card.className = `subject-card ${isSelected ? 'active' : ''}`;
    card.innerHTML = `
      <div class="subject-icon">${sub.icon}</div>
      <div class="subject-name">${sub.name}</div>
      <div class="subject-galaxy-badge">${count > 0 ? `${count} Hệ sao` : 'Chưa mở'}</div>
    `;
    card.onclick = () => selectSubject(sub.code);
    subjectsContainer.appendChild(card);
  });

  // Filter galaxies for Selected Grade & Subject
  const filteredGalaxies = APP_STATE.galaxies.filter(g => {
    const matchGrade = (g.grade === APP_STATE.selectedGrade || (!g.grade && APP_STATE.selectedGrade === '10'));
    const matchSubject = (g.subject_code === APP_STATE.selectedSubject || (g.subject && g.subject.includes(APP_STATE.selectedSubject)));
    return matchGrade && matchSubject;
  });

  document.getElementById('portal-selected-subject-name').textContent = `${APP_STATE.selectedSubject} - Khối ${APP_STATE.selectedGrade}`;

  const listContainer = document.getElementById('portal-galaxies-list');
  listContainer.innerHTML = '';

  if (filteredGalaxies.length === 0) {
    listContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.15); border-radius: 16px;">
        <div style="font-size: 45px; margin-bottom: 12px;">🛰️</div>
        <h3 style="font-size: 1.2rem; margin-bottom: 8px; color: #fff;">Chưa có Hệ Sao nào cho ${APP_STATE.selectedSubject} - Khối ${APP_STATE.selectedGrade}</h3>
        <p style="color: var(--text-dim); max-width: 500px; margin: 0 auto 20px; font-size: 0.92rem;">
          Hãy dùng chức năng "Lò Phản Ứng Dữ Liệu" để tải lên file đề cương (.docx, .pdf). AI sẽ tự động phân loại và kiến tạo một chòm sao mới ngay lập tức!
        </p>
        <button class="sci-btn sci-btn-primary" onclick="switchScreen('reactor')">
          ⚡ Nạp Đề Cương Vào Lò Phản Ứng
        </button>
      </div>
    `;
    return;
  }

  filteredGalaxies.forEach(galaxy => {
    const card = document.createElement('div');
    card.className = 'galaxy-portal-card';

    const stations = galaxy.stations || [];
    const completedCount = stations.filter(s => (APP_STATE.user.completed_stations || []).includes(s.id)).length;
    const progressPct = stations.length > 0 ? Math.round((completedCount / stations.length) * 100) : 0;

    card.innerHTML = `
      <div>
        <div class="portal-card-header">
          <div class="portal-card-icon">${galaxy.icon || '🪐'}</div>
          <div>
            <h3 style="font-size:1.25rem; font-weight:700; color:#fff;">${galaxy.name}</h3>
            <span style="font-size:0.8rem; color:var(--cyan-glow);">${galaxy.subject || `${galaxy.subject_code} ${galaxy.grade}`}</span>
          </div>
        </div>
        <p style="font-size:0.9rem; color:var(--text-dim); line-height:1.5;">${galaxy.description || 'Chinh phục các trạm không gian kiến thức để nâng cao năng lực.'}</p>
        
        <div class="portal-card-meta">
          <div>🛰️ <strong>${stations.length}</strong> Trạm câu hỏi</div>
          <div>✨ <strong>${progressPct}%</strong> Hoàn thành</div>
          <div>🕳️ Boss Hố Đen</div>
        </div>
      </div>

      <button class="sci-btn sci-btn-primary" style="width:100%; margin-top:10px;" onclick="enterGalaxyStage('${galaxy.id}')">
        🚀 Chinh Phục Bản Đồ Sao ➜
      </button>
    `;
    listContainer.appendChild(card);
  });
}

function renderAntiGravityStage() {
  const activeGalaxy = APP_STATE.galaxies.find(g => g.id === APP_STATE.activeGalaxyId) || APP_STATE.galaxies[0];
  if (!activeGalaxy) {
    returnToRouteSelection();
    return;
  }

  // Update Breadcrumbs
  document.getElementById('crumb-grade').textContent = `Khối ${activeGalaxy.grade || APP_STATE.selectedGrade || '10'}`;
  document.getElementById('crumb-subject').textContent = activeGalaxy.subject_code || APP_STATE.selectedSubject || 'Môn Học';
  document.getElementById('crumb-galaxy').textContent = activeGalaxy.name;

  // Render Tabs for sibling galaxies in same subject
  const tabsContainer = document.getElementById('galaxy-tabs');
  tabsContainer.innerHTML = '';

  const siblingGalaxies = APP_STATE.galaxies.filter(g => 
    (g.grade === activeGalaxy.grade) && 
    (g.subject_code === activeGalaxy.subject_code)
  );

  siblingGalaxies.forEach(galaxy => {
    const tab = document.createElement('div');
    tab.className = `galaxy-tab ${galaxy.id === activeGalaxy.id ? 'active' : ''}`;
    tab.innerHTML = `${galaxy.icon || '🪐'} ${galaxy.name}`;
    tab.onclick = () => {
      window.soundEngine.click();
      APP_STATE.activeGalaxyId = galaxy.id;
      renderAntiGravityStage();
    };
    tabsContainer.appendChild(tab);
  });

  document.getElementById('current-galaxy-title').textContent = activeGalaxy.name;
  document.getElementById('current-galaxy-subject').textContent = activeGalaxy.subject;

  // Vẽ các trạm lên sân khấu Anti-gravity
  const stage = document.getElementById('anti-gravity-stage');
  stage.innerHTML = '';

  // Vẽ đường nối chòm sao (Constellation SVG)
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("style", "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2;");
  stage.appendChild(svg);

  const stations = activeGalaxy.stations || [];
  for (let i = 0; i < stations.length - 1; i++) {
    const s1 = stations[i];
    const s2 = stations[i + 1];
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", `${s1.coordinates.x}%`);
    line.setAttribute("y1", `${s1.coordinates.y}%`);
    line.setAttribute("x2", `${s2.coordinates.x}%`);
    line.setAttribute("y2", `${s2.coordinates.y}%`);
    line.setAttribute("stroke", "rgba(0, 242, 254, 0.35)");
    line.setAttribute("stroke-dasharray", "4,4");
    line.setAttribute("stroke-width", "2");
    svg.appendChild(line);
  }

  // Render các trạm không gian
  stations.forEach((st) => {
    const node = document.createElement('div');
    const isCompleted = (APP_STATE.user.completed_stations || []).includes(st.id);
    node.className = `station-node level-${st.level.toLowerCase()} ${isCompleted ? 'completed' : ''}`;
    node.style.left = `${st.coordinates.x}%`;
    node.style.top = `${st.coordinates.y}%`;
    node.title = `${st.title} (${st.level}) - Thưởng ${st.exp_reward} EXP`;

    const iconMap = {
      'NhanBiet': '🛰️',
      'ThongHieu': '📡',
      'VanDung': '⚛️',
      'VanDungCao': '🔮'
    };

    node.innerHTML = `
      <div class="station-node-icon">${iconMap[st.level] || '🛰️'}</div>
      <div class="station-label-bubble">${st.title}</div>
    `;

    node.onclick = () => openStationBattle(activeGalaxy, st);
    stage.appendChild(node);
  });

  // Render Boss Blackhole nếu có
  if (activeGalaxy.boss_blackhole) {
    const boss = activeGalaxy.boss_blackhole;
    const completedCount = stations.filter(s => (APP_STATE.user.completed_stations || []).includes(s.id)).length;
    const isUnlocked = completedCount >= (boss.unlock_stars_required || 2);

    const bossNode = document.createElement('div');
    bossNode.className = `boss-node ${isUnlocked ? '' : 'locked'}`;
    bossNode.style.left = `88%`;
    bossNode.style.top = `30%`;
    bossNode.title = isUnlocked ? boss.title : `Cần hoàn thành tối thiểu ${boss.unlock_stars_required} sao để mở khóa Hố Đen!`;
    bossNode.innerHTML = `<span style="font-size:32px;">🕳️</span>`;

    bossNode.onclick = () => {
      if (!isUnlocked) {
        window.soundEngine.wrong();
        alert(`⚠️ CẢNH BÁO: Hố Đen bị khóa bởi khiên lực trường! Hãy vượt qua thêm ${boss.unlock_stars_required - completedCount} trạm sao vệ tinh để giải mã.`);
      } else {
        openBossChallenge(activeGalaxy, boss);
      }
    };
    stage.appendChild(bossNode);
  }
}

// --- BATTLE / QUIZ MODAL STAGE ---
function openStationBattle(galaxy, station) {
  window.soundEngine.warp();
  APP_STATE.activeStation = station;

  const modal = document.getElementById('battle-modal');
  modal.classList.add('active');

  document.getElementById('battle-station-title').textContent = `${station.title} • [${station.level}]`;
  document.getElementById('battle-question-text').textContent = station.question;

  // Ẩn box gợi ý cũ
  const hintBox = document.getElementById('battle-ai-hint-box');
  hintBox.style.display = 'none';
  hintBox.textContent = '';

  const optionsContainer = document.getElementById('battle-options-list');
  optionsContainer.innerHTML = '';

  station.options.forEach(optText => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = optText;
    btn.onclick = () => handleSelectOption(galaxy.id, station.id, optText.charAt(0), btn);
    optionsContainer.appendChild(btn);
  });

  // Khởi động đếm ngược 30 giây
  startBattleCountdown();
}

function startBattleCountdown() {
  clearInterval(APP_STATE.countdownTimer);
  APP_STATE.countdownSec = 30;

  const timerEl = document.getElementById('battle-countdown-num');
  timerEl.textContent = APP_STATE.countdownSec;
  timerEl.parentElement.classList.remove('timer-critical');

  APP_STATE.countdownTimer = setInterval(() => {
    APP_STATE.countdownSec--;
    timerEl.textContent = APP_STATE.countdownSec;

    if (APP_STATE.countdownSec <= 10) {
      timerEl.parentElement.classList.add('timer-critical');
      window.soundEngine.tick();
    }

    if (APP_STATE.countdownSec <= 0) {
      clearInterval(APP_STATE.countdownTimer);
      window.soundEngine.wrong();
      handleTimeOut();
    }
  }, 1000);
}

async function handleSelectOption(galaxyId, stationId, selectedLetter, buttonEl) {
  clearInterval(APP_STATE.countdownTimer);
  window.soundEngine.click();

  // Khóa tất cả các nút
  document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);

  try {
    const res = await apiRequest('/api/station/answer', 'POST', {
      galaxy_id: galaxyId,
      station_id: stationId,
      selected_option: selectedLetter
    });

    if (res.is_correct) {
      buttonEl.classList.add('correct');
      window.soundEngine.correct();
      alert(`🎉 CHÍNH XÁC! Bạn nhận được +${res.exp_gained} EXP và nạp lại bình Oxy!`);
    } else {
      buttonEl.classList.add('wrong');
      window.soundEngine.wrong();
      // Highlight đáp án đúng
      document.querySelectorAll('.option-btn').forEach(btn => {
        if (btn.textContent.trim().startsWith(res.correct_answer)) {
          btn.classList.add('correct');
        }
      });
      alert(`💥 SAI RỒI! Hệ thống bị hao hụt năng lượng Oxy (${res.oxy_delta}%). Đáp án đúng là ${res.correct_answer}.`);
    }

    await loadUserData();
    updateTopHUD();

    setTimeout(() => {
      closeBattleModal();
      renderSpaceMap();
    }, 1500);

  } catch (err) {
    alert('Lỗi nộp đáp án: ' + err.message);
  }
}

function handleTimeOut() {
  document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
  alert('⏱️ HẾT GIỜ! Năng lượng trạm đã suy hao.');
  setTimeout(() => {
    closeBattleModal();
  }, 1000);
}

function closeBattleModal() {
  clearInterval(APP_STATE.countdownTimer);
  document.getElementById('battle-modal').classList.remove('active');
}

// Nút "Gọi cứu viện AI"
async function requestAIHint() {
  if (!APP_STATE.activeStation) return;
  window.soundEngine.hint();

  const hintBox = document.getElementById('battle-ai-hint-box');
  hintBox.style.display = 'block';
  hintBox.textContent = '🤖 Đang kết nối Trợ lý AI Coze / Gemini...';

  const userApiKey = document.getElementById('reactor-api-key') ? document.getElementById('reactor-api-key').value.trim() : null;

  try {
    const res = await apiRequest('/api/station/hint', 'POST', {
      question: APP_STATE.activeStation.question,
      options: APP_STATE.activeStation.options,
      current_hint: APP_STATE.activeStation.ai_hint || 'Gợi ý: Đọc kỹ các từ khóa trong đề bài.',
      api_key: userApiKey
    });
    hintBox.textContent = res.hint;
  } catch (e) {
    hintBox.textContent = `💡 Gợi ý định hướng: ${APP_STATE.activeStation.ai_hint || 'Hãy phân tích các phương án đối lập.'}`;
  }
}

// --- BOSS CHALLENGE (HỐ ĐEN TỔNG HỢP SGK KẾT NỐI TRI THỨC) ---
let BOSS_EXAM_STATE = {
  galaxy: null,
  boss: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  timer: null,
  remainingSeconds: 360
};

function openBossChallenge(galaxy, boss) {
  window.soundEngine.warp();

  let questions = boss.questions || [];
  if (questions.length === 0) {
    questions = (galaxy.stations || []).map((st, i) => ({
      id: `BH_${i+1}`,
      chapter: `Kiến thức tổng hợp: ${galaxy.subject}`,
      question: st.question,
      options: st.options,
      correct_answer: st.correct_answer,
      explanation: `Dựa trên hệ thống bài học chuyên đề ${galaxy.subject} thuộc chương trình SGK Kết Nối Tri Thức Với Cuộc Sống.`
    }));
  }

  BOSS_EXAM_STATE = {
    galaxy: galaxy,
    boss: boss,
    questions: questions,
    currentIndex: 0,
    answers: {},
    timer: null,
    remainingSeconds: boss.time_limit_seconds || 360
  };

  document.getElementById('boss-exam-title').textContent = boss.title || `Hố Đen Tổng Hợp: ${galaxy.name}`;
  document.getElementById('boss-exam-curriculum').textContent = boss.curriculum || 'SGK Kết Nối Tri Thức Với Cuộc Sống';

  document.getElementById('boss-active-view').style.display = 'block';
  document.getElementById('boss-result-view').style.display = 'none';

  renderBossQuestion();
  startBossTimer();

  const modal = document.getElementById('boss-exam-modal');
  modal.classList.add('active');
}

function startBossTimer() {
  clearInterval(BOSS_EXAM_STATE.timer);

  const updateDisplay = () => {
    const mins = Math.floor(BOSS_EXAM_STATE.remainingSeconds / 60);
    const secs = BOSS_EXAM_STATE.remainingSeconds % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    const timerText = document.getElementById('boss-timer-text');
    const timerCircle = document.getElementById('boss-timer-circle');
    timerText.textContent = timeStr;

    if (BOSS_EXAM_STATE.remainingSeconds <= 60) {
      timerText.classList.add('boss-timer-critical');
      timerCircle.classList.add('boss-timer-critical');
      window.soundEngine.tick();
    } else {
      timerText.classList.remove('boss-timer-critical');
      timerCircle.classList.remove('boss-timer-critical');
    }
  };

  updateDisplay();

  BOSS_EXAM_STATE.timer = setInterval(() => {
    BOSS_EXAM_STATE.remainingSeconds--;
    updateDisplay();

    if (BOSS_EXAM_STATE.remainingSeconds <= 0) {
      clearInterval(BOSS_EXAM_STATE.timer);
      window.soundEngine.wrong();
      alert('⏱️ HẾT GIỜ THỬ THÁCH HỐ ĐEN! Hệ thống đang tự động nộp bài thi của bạn...');
      submitBossExam();
    }
  }, 1000);
}

function renderBossQuestion() {
  const qList = BOSS_EXAM_STATE.questions;
  const currentIdx = BOSS_EXAM_STATE.currentIndex;
  const currentQ = qList[currentIdx];
  if (!currentQ) return;

  // Render Navigation Ribbon
  const ribbon = document.getElementById('boss-nav-ribbon');
  ribbon.innerHTML = '';
  qList.forEach((q, idx) => {
    const btn = document.createElement('div');
    const isAnswered = BOSS_EXAM_STATE.answers[idx] !== undefined;
    const isActive = (idx === currentIdx);

    btn.className = `boss-nav-btn ${isActive ? 'active' : ''} ${isAnswered ? 'answered' : ''}`;
    btn.textContent = idx + 1;
    btn.onclick = () => {
      window.soundEngine.click();
      BOSS_EXAM_STATE.currentIndex = idx;
      renderBossQuestion();
    };
    ribbon.appendChild(btn);
  });

  // Render Question details
  document.getElementById('boss-chapter-badge').innerHTML = `📖 ${currentQ.chapter || 'SGK Kết Nối Tri Thức'}`;
  document.getElementById('boss-question-prompt').textContent = `Câu ${currentIdx + 1}: ${currentQ.question}`;

  // Render Options
  const grid = document.getElementById('boss-options-grid');
  grid.innerHTML = '';

  const selectedAnswer = BOSS_EXAM_STATE.answers[currentIdx];

  currentQ.options.forEach(optText => {
    const letter = optText.trim().charAt(0);
    const item = document.createElement('div');
    item.className = `boss-option-item ${selectedAnswer === letter ? 'selected' : ''}`;
    
    item.innerHTML = `
      <span class="boss-option-letter">${letter}</span>
      <span style="line-height:1.5;">${optText.substring(2).trim() || optText}</span>
    `;

    item.onclick = () => {
      window.soundEngine.click();
      BOSS_EXAM_STATE.answers[currentIdx] = letter;
      renderBossQuestion();
    };

    grid.appendChild(item);
  });

  // Update controls
  document.getElementById('boss-prev-btn').disabled = (currentIdx === 0);
  document.getElementById('boss-next-btn').disabled = (currentIdx === qList.length - 1);

  const answeredCount = Object.keys(BOSS_EXAM_STATE.answers).length;
  document.getElementById('boss-progress-status').textContent = `Đã hoàn thành: ${answeredCount} / ${qList.length} câu`;
}

function prevBossQuestion() {
  if (BOSS_EXAM_STATE.currentIndex > 0) {
    window.soundEngine.click();
    BOSS_EXAM_STATE.currentIndex--;
    renderBossQuestion();
  }
}

function nextBossQuestion() {
  if (BOSS_EXAM_STATE.currentIndex < BOSS_EXAM_STATE.questions.length - 1) {
    window.soundEngine.click();
    BOSS_EXAM_STATE.currentIndex++;
    renderBossQuestion();
  }
}

function confirmExitBoss() {
  if (confirm('⚠️ Bạn có chắc muốn rút lui khỏi Hố Đen? Mọi tiến độ bài thi sẽ bị hủy.')) {
    clearInterval(BOSS_EXAM_STATE.timer);
    document.getElementById('boss-exam-modal').classList.remove('active');
  }
}

async function submitBossExam() {
  clearInterval(BOSS_EXAM_STATE.timer);
  window.soundEngine.warp();

  const qList = BOSS_EXAM_STATE.questions;
  let correctCount = 0;

  qList.forEach((q, idx) => {
    const userAns = BOSS_EXAM_STATE.answers[idx];
    if (userAns && userAns.toUpperCase() === q.correct_answer.toUpperCase()) {
      correctCount++;
    }
  });

  const total = qList.length;
  const scorePercent = total > 0 ? (correctCount / total) * 100 : 0;
  const isPassed = (scorePercent >= (BOSS_EXAM_STATE.boss.pass_percentage || 80));

  try {
    const res = await apiRequest('/api/boss/submit', 'POST', {
      galaxy_id: BOSS_EXAM_STATE.galaxy.id,
      score: correctCount,
      total: total,
      time_spent: (BOSS_EXAM_STATE.boss.time_limit_seconds || 360) - BOSS_EXAM_STATE.remainingSeconds
    });

    // Update Result View
    document.getElementById('boss-active-view').style.display = 'none';
    const resultView = document.getElementById('boss-result-view');
    resultView.style.display = 'block';

    const iconEl = document.getElementById('boss-result-icon');
    const headlineEl = document.getElementById('boss-result-headline');
    const subEl = document.getElementById('boss-result-sub');

    if (isPassed) {
      window.soundEngine.correct();
      iconEl.textContent = '👑';
      headlineEl.textContent = 'XUẤT SẮC VƯỢT ẢI HỐ ĐEN KẾT NỐI TRI THỨC!';
      headlineEl.style.color = '#ffd700';
      subEl.textContent = `Chỉ huy đã đạt chuẩn kiến thức học kỳ môn ${BOSS_EXAM_STATE.galaxy.subject}. Huy hiệu vinh dự đã được trao!`;
    } else {
      window.soundEngine.wrong();
      iconEl.textContent = '🕳️';
      headlineEl.textContent = 'CHƯA ĐỦ ĐIỀU KIỆN VƯỢT ẢI (CẦN TỐI THIỂU 80%)';
      headlineEl.style.color = 'var(--accent-red)';
      subEl.textContent = `Bạn đã nỗ lực, nhưng lực hút của Hố Đen quá lớn. Hãy xem lại giải thích SGK bên dưới để chuẩn bị cho lần thử sau!`;
    }

    document.getElementById('boss-result-score').textContent = `${correctCount} / ${total}`;
    document.getElementById('boss-result-exp').textContent = `+${res.bonus_exp} EXP`;
    document.getElementById('boss-result-percent').textContent = `${scorePercent.toFixed(1)}%`;
    document.getElementById('boss-result-percent').style.color = isPassed ? 'var(--accent-green)' : 'var(--accent-red)';

    // Render Detailed Explanations from SGK Kết Nối Tri Thức
    const reviewList = document.getElementById('boss-review-list');
    reviewList.innerHTML = '';

    qList.forEach((q, idx) => {
      const userAns = BOSS_EXAM_STATE.answers[idx] || 'Chưa trả lời';
      const isCorrect = (userAns.toUpperCase() === q.correct_answer.toUpperCase());
      
      const item = document.createElement('div');
      item.className = `boss-review-item ${isCorrect ? 'boss-review-correct' : 'boss-review-wrong'}`;
      item.innerHTML = `
        <div style="font-size:0.85rem; color:var(--cyan-glow); margin-bottom:4px;">📖 ${q.chapter}</div>
        <div style="font-weight:700; color:#fff; margin-bottom:8px;">Câu ${idx + 1}: ${q.question}</div>
        <div style="font-size:0.9rem; margin-bottom:6px;">
          Lựa chọn của bạn: <strong style="color:${isCorrect ? 'var(--accent-green)' : 'var(--accent-red)'}">${userAns}</strong> 
          • Đáp án chuẩn: <strong style="color:var(--accent-green);">${q.correct_answer}</strong>
        </div>
        <div class="boss-explanation-box">
          💡 <strong>Nội dung SGK Kết Nối Tri Thức:</strong> ${q.explanation || 'Kiến thức cốt lõi trong bộ sách giáo khoa Kết Nối Tri Thức Với Cuộc Sống.'}
        </div>
      `;
      reviewList.appendChild(item);
    });

    await loadUserData();
    updateTopHUD();
  } catch (err) {
    alert('Lỗi nộp bài thi Hố Đen: ' + err.message);
  }
}

function closeBossExamModal() {
  clearInterval(BOSS_EXAM_STATE.timer);
  document.getElementById('boss-exam-modal').classList.remove('active');
  switchScreen('leaderboard');
}

// Window global bindings
window.selectGrade = selectGrade;
window.selectSubject = selectSubject;
window.returnToRouteSelection = returnToRouteSelection;
window.enterGalaxyStage = enterGalaxyStage;
window.openBossChallenge = openBossChallenge;
window.prevBossQuestion = prevBossQuestion;
window.nextBossQuestion = nextBossQuestion;
window.submitBossExam = submitBossExam;
window.confirmExitBoss = confirmExitBoss;
window.closeBossExamModal = closeBossExamModal;

// --- LEADERBOARD STAGE ---
async function renderLeaderboard() {
  try {
    const lb = await apiRequest('/api/leaderboard');
    const tbody = document.getElementById('leaderboard-tbody');
    tbody.innerHTML = '';

    lb.forEach((player, idx) => {
      const tr = document.createElement('tr');
      tr.className = 'leaderboard-row';

      const rankBadge = idx < 3 
        ? `<span class="rank-pill rank-${idx + 1}">${idx + 1}</span>` 
        : `<span style="font-weight:700;padding-left:10px;">#${player.rank}</span>`;

      tr.innerHTML = `
        <td>${rankBadge}</td>
        <td><strong>${player.name}</strong> <span style="font-size:0.8rem;color:#94a3b8">(${player.class_name})</span></td>
        <td style="color:#00f2fe;">🚀 ${player.ship}</td>
        <td><span class="streak-flame">🔥 ${player.streak} ngày</span></td>
        <td style="font-weight:700;color:#ffd700;">${player.score.toLocaleString()} EXP</td>
        <td><span style="font-size:0.85rem;color:#52c41a;">${player.badge}</span></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error('Lỗi tải leaderboard:', e);
  }
}

// --- EVENT LISTENERS SETUP ---
function setupEventListeners() {
  // Navigation buttons
  document.getElementById('nav-btn-hub').onclick = () => switchScreen('hub');
  document.getElementById('nav-btn-map').onclick = () => {
    APP_STATE.isPlayMode = false;
    switchScreen('map');
  };
  document.getElementById('nav-btn-reactor').onclick = () => switchScreen('reactor');
  document.getElementById('nav-btn-leaderboard').onclick = () => switchScreen('leaderboard');

  // Hub action buttons
  document.getElementById('hub-tile-map').onclick = () => {
    APP_STATE.isPlayMode = false;
    switchScreen('map');
  };
  document.getElementById('hub-tile-reactor').onclick = () => switchScreen('reactor');
  document.getElementById('hub-tile-leaderboard').onclick = () => switchScreen('leaderboard');

  // Reactor drag & drop
  const dropzone = document.getElementById('reactor-dropzone');
  const fileInput = document.getElementById('reactor-file-input');

  dropzone.onclick = () => fileInput.click();
  fileInput.onchange = (e) => {
    if (e.target.files.length > 0) handleFileUpload(e.target.files[0]);
  };

  dropzone.ondragover = (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  };
  dropzone.ondragleave = () => dropzone.classList.remove('dragover');
  dropzone.ondrop = (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) handleFileUpload(e.dataTransfer.files[0]);
  };

  // Sound toggle button
  const soundToggle = document.getElementById('btn-sound-toggle');
  if (soundToggle) {
    soundToggle.onclick = () => {
      window.soundEngine.enabled = !window.soundEngine.enabled;
      soundToggle.textContent = window.soundEngine.enabled ? '🔊 Bật Âm Thanh' : '🔇 Tắt Âm Thanh';
    };
  }
}
