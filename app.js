const quizData = [
  {
    question: 'Tag HTML apa yang digunakan untuk membuat heading paling besar?',
    options: ['<h6>', '<heading>', '<h1>', '<head>'],
    correct: 2,
  },
  {
    question: 'CSS adalah singkatan dari?',
    options: [
      'Cascading Style Sheets',
      'Computer Style Sheets',
      'Creative Style System',
      'Colorful Style Sheets',
    ],
    correct: 0,
  },
  {
    question: 'Fungsi JavaScript untuk mengambil data dari internet (Fetch API) adalah?',
    options: ['request()', 'getData()', 'fetch()', 'load()'],
    correct: 2,
  },
  {
    question: 'Properti CSS untuk membuat layout grid adalah?',
    options: ['display: grid', 'position: grid', 'layout: grid', 'grid: true'],
    correct: 0,
  },
  {
    question: 'Method array JavaScript untuk mengubah tiap elemen jadi elemen baru adalah?',
    options: ['filter()', 'map()', 'forEach()', 'reduce()'],
    correct: 1,
  },
  {
    question: 'localStorage dipakai untuk?',
    options: [
      'Mengirim data ke server',
      'Menyimpan data di browser secara permanen',
      'Membuat animasi CSS',
      'Validasi form',
    ],
    correct: 1,
  },
  {
    question: 'Fungsi apa yang dipakai untuk "mendengarkan" klik pada tombol di JavaScript?',
    options: ['addEventListener()', 'onClick()', 'listenEvent()', 'watchClick()'],
    correct: 0,
  },
  {
    question: 'Tag HTML untuk membuat daftar bernomor adalah?',
    options: ['<ul>', '<ol>', '<li>', '<dl>'],
    correct: 1,
  },
  {
    question: 'Properti CSS untuk mengatur jarak antar item di Flexbox/Grid adalah?',
    options: ['spacing', 'margin-all', 'gap', 'distance'],
    correct: 2,
  },
  {
    question: 'DOM adalah singkatan dari?',
    options: [
      'Document Object Model',
      'Data Object Management',
      'Display Output Mode',
      'Document Oriented Markup',
    ],
    correct: 0,
  },
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const USERS_KEY = 'quizUsers';
const SESSION_KEY = 'quizCurrentUser';

let currentUser = null;
let authMode = 'login'; // 'login' | 'register'
let currentQuestion = 0;
let score = 0;
let answered = false; // cegah klik ganda di soal yang sama

const authScreenEl = document.getElementById('authScreen');
const menuScreenEl = document.getElementById('menuScreen');
const quizAppEl = document.getElementById('quizApp');

const authTabs = document.querySelectorAll('.auth-tab');
const authForm = document.getElementById('authForm');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const authErrorEl = document.getElementById('authError');
const authSubmitBtn = document.getElementById('authSubmitBtn'); 

const welcomeTextEl = document.getElementById('welcomeText');
const historyListEl = document.getElementById('historyList');
const startQuizBtn = document.getElementById('startQuizBtn');
const logoutBtn = document.getElementById('logoutBtn');

const quizContentEl = document.getElementById('quizContent');
const resultEl = document.getElementById('result');
const progressEl = document.getElementById('progress');
const tallyRowEl = document.getElementById('tallyRow');
const questionBadgeEl = document.getElementById('questionBadge');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('nextBtn');
const gradeStampEl = document.getElementById('gradeStamp');
const scoreValueEl = document.getElementById('scoreValue');
const highScoreEl = document.getElementById('highScore');
const restartBtn = document.getElementById('restartBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');

const showScreen = (screenEl) => {
  [authScreenEl, menuScreenEl, quizAppEl].forEach((el) => el.classList.add('hidden'));
  screenEl.classList.remove('hidden');
};

const loadUsers = () => {
  const saved = localStorage.getItem(USERS_KEY);
  return saved ? JSON.parse(saved) : {};
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

authTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    authTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    authMode = tab.dataset.tab;
    authSubmitBtn.textContent = authMode === 'login' ? 'Masuk' : 'Daftar';
    authErrorEl.classList.add('hidden');
  });
});

authForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  const users = loadUsers();

  if (authMode === 'register') {
    if (users[username]) {
      showAuthError('Nama pengguna sudah terdaftar. Coba Masuk, atau pakai nama lain.');
      return;
    }
    users[username] = { password, history: [] };
    saveUsers(users);
    loginAs(username);
  } else {
    const account = users[username];
    if (!account || account.password !== password) {
      showAuthError('Nama pengguna atau kata sandi salah.');
      return;
    }
    loginAs(username);
  }
});

const showAuthError = (message) => {
  authErrorEl.textContent = `⚠️ ${message}`;
  authErrorEl.classList.remove('hidden');
};

const loginAs = (username) => {
  currentUser = username;
  localStorage.setItem(SESSION_KEY, username);
  authForm.reset();
  authErrorEl.classList.add('hidden');
  renderMenu();
};

logoutBtn.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem(SESSION_KEY);
  showScreen(authScreenEl);
});

const renderMenu = () => {
  welcomeTextEl.textContent = `Halo, ${currentUser}! Siap coba quiznya lagi?`;

  const users = loadUsers();
  const history = (users[currentUser] && users[currentUser].history) || [];

  historyListEl.innerHTML = '';

  if (history.length === 0) {
    const empty = document.createElement('p');
    empty.classList.add('history-empty');
    empty.textContent = 'Belum ada percobaan. Yuk mulai quiz pertamamu!';
    historyListEl.appendChild(empty);
  } else {
  
    history
      .slice()
      .reverse()
      .slice(0, 5)
      .forEach((attempt) => {
        const item = document.createElement('div');
        item.classList.add('history-item');

        const dateSpan = document.createElement('span');
        dateSpan.classList.add('history-item__date');
        dateSpan.textContent = attempt.date;

        const scoreSpan = document.createElement('span');
        scoreSpan.classList.add('history-item__score');
        if (attempt.percentage < 60) scoreSpan.classList.add('is-low');
        scoreSpan.textContent = `${attempt.score}/${attempt.total} · ${attempt.percentage}%`;

        item.appendChild(dateSpan);
        item.appendChild(scoreSpan);
        historyListEl.appendChild(item);
      });
  }

  showScreen(menuScreenEl);
};

startQuizBtn.addEventListener('click', () => {
  currentQuestion = 0;
  score = 0;
  resultEl.classList.add('hidden');
  quizContentEl.classList.remove('hidden');
  showScreen(quizAppEl);
  renderQuestion();
});

backToMenuBtn.addEventListener('click', () => {
  renderMenu();
});

const renderTally = () => {
  tallyRowEl.innerHTML = '';

  quizData.forEach((_, index) => {
    const mark = document.createElement('span');
    mark.classList.add('tally-mark');

    if (index < currentQuestion) {
      mark.classList.add('tally-mark--done');
    }

    if (index % 5 === 4 && index < currentQuestion) {
      mark.classList.add('tally-mark--strike');
    }

    tallyRowEl.appendChild(mark);
  });
};

const renderQuestion = () => {
  answered = false;
  const q = quizData[currentQuestion];

  progressEl.textContent = `Soal ${currentQuestion + 1} / ${quizData.length}`;
  questionBadgeEl.textContent = currentQuestion + 1;
  questionEl.textContent = q.question;
  renderTally();

  optionsEl.innerHTML = '';
  q.options.forEach((optionText, index) => {
    const btn = document.createElement('button');
    btn.classList.add('option-btn');
    btn.dataset.index = index; 

    const bubble = document.createElement('span');
    bubble.classList.add('option-bubble');
    bubble.textContent = OPTION_LETTERS[index];

    const label = document.createElement('span');
    label.classList.add('option-label');
    label.textContent = optionText;

    btn.appendChild(bubble);
    btn.appendChild(label);
    optionsEl.appendChild(btn);
  });

  nextBtn.classList.add('hidden');
};

optionsEl.addEventListener('click', (event) => {
  const btn = event.target.closest('.option-btn');
  if (!btn || answered) return; // bukan tombol opsi, atau sudah dijawab

  answered = true;
  const selectedIndex = parseInt(btn.dataset.index, 10);
  const correctIndex = quizData[currentQuestion].correct;

  const allButtons = optionsEl.querySelectorAll('.option-btn');
  allButtons.forEach((b) => (b.disabled = true));

  if (selectedIndex === correctIndex) {
    btn.classList.add('correct');
    score++;
  } else {
    btn.classList.add('wrong');
    allButtons[correctIndex].classList.add('correct'); 
  }

  nextBtn.classList.remove('hidden');
});

nextBtn.addEventListener('click', () => {
  currentQuestion++;

  if (currentQuestion < quizData.length) {
    renderQuestion();
  } else {
    showResult();
  }
});

const showResult = () => {
  renderTally();

  const total = quizData.length;
  const percentage = Math.round((score / total) * 100);

  scoreValueEl.textContent = `${percentage}%`;

  const users = loadUsers();
  const attempt = {
    date: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
    score,
    total,
    percentage,
  };
  users[currentUser].history.push(attempt);
  saveUsers(users);

  const previousAttempts = users[currentUser].history.slice(0, -1);
  const previousBest = previousAttempts.reduce(
    (max, a) => Math.max(max, a.percentage),
    0
  );

  if (percentage > previousBest) {
    highScoreEl.textContent = `Rekor baru! Sebelumnya ${previousBest}%`;
    highScoreEl.classList.add('is-new-record');
  } else {
    highScoreEl.textContent = `Rekor tertinggi kamu: ${previousBest}%`;
    highScoreEl.classList.remove('is-new-record');
  }

  quizContentEl.classList.add('hidden');
  resultEl.classList.remove('hidden');
};

restartBtn.addEventListener('click', () => {
  currentQuestion = 0;
  score = 0;

  resultEl.classList.add('hidden');
  quizContentEl.classList.remove('hidden');

  renderQuestion();
});

const savedUser = localStorage.getItem(SESSION_KEY);
const users = loadUsers();

if (savedUser && users[savedUser]) {
  currentUser = savedUser;
  renderMenu();
} else {
  showScreen(authScreenEl);
}