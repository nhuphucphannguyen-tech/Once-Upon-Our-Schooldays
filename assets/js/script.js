/* =============================================================
   ONCE UPON OUR SCHOOLDAYS - JAVASCRIPT INTERACTIONS
============================================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* -------------------------------------------------------------
       1. TẠO POPUP MODAL ZOOM ẢNH & HIỂN THỊ CẢM NGHĨ
    ------------------------------------------------------------- */
    // Tạo cấu trúc Modal động dán vào HTML nếu chưa có
    const modalHTML = `
        <div class="photo-modal" id="photoModal">
            <div class="modal-overlay" id="modalOverlay"></div>
            <div class="modal-card">
                <button class="modal-close-btn" id="modalCloseBtn">✖</button>
                <div class="modal-washi"></div>
                <div class="modal-img-wrapper">
                    <img id="modalImage" src="" alt="Ảnh kỷ niệm phóng to">
                </div>
                <div class="modal-content">
                    <h3 class="modal-title" id="modalTitle">Tiêu đề sự kiện</h3>
                    <p class="modal-date" id="modalDate">🗓 Ngày/Tháng/Năm</p>
                    <div class="modal-story" id="modalStory">
                        Nội dung chi tiết câu chuyện kỷ niệm...
                    </div>
                    <div class="modal-quotes">
                        <span class="quote-tag">💬 Cảm nghĩ từ thành viên:</span>
                        <p class="quote-text" id="modalQuote">"Những lời tâm sự thân thương..."</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Lấy các phần tử Modal
    const photoModal = document.getElementById('photoModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDate = document.getElementById('modalDate');
    const modalStory = document.getElementById('modalStory');
    const modalQuote = document.getElementById('modalQuote');

    // Hàm Mở Modal với thông tin ảnh
    function openPhotoModal(data) {
        modalImage.src = data.imgSrc || 'https://picsum.photos/600/400';
        modalTitle.textContent = data.title || 'Khoảnh Khắc Kỷ Niệm';
        modalDate.textContent = data.date || 'Mùa hạ năm ấy';
        modalStory.textContent = data.story || 'Một kỷ niệm đẹp không thể nào quên của tập thể lớp chúng mình...';
        modalQuote.textContent = data.quote || '"Cảm ơn vì đã là một phần trong thanh xuân của nhau!"';

        photoModal.classList.add('active');
        playPageTurnSound(); // Phát âm thanh mở thiệp
    }

    // Hàm Đóng Modal
    function closeModal() {
        photoModal.classList.remove('active');
    }

    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Gán sự kiện Click cho tất cả ảnh Polaroid
    const polaroidCards = document.querySelectorAll('.polaroid-card');
    polaroidCards.forEach((card) => {
        card.addEventListener('click', () => {
            const img = card.querySelector('img');
            const caption = card.querySelector('.polaroid-caption');

            // Đọc thông tin từ data attributes (hoặc thông tin mặc định)
            const photoData = {
                imgSrc: img ? img.src : '',
                title: caption ? caption.textContent : 'Kỷ niệm lớp',
                date: card.dataset.date || 'Tháng 9/2023',
                story: card.dataset.story || 'Những ngày đầu tiên bước chân vào ngôi trường mới, bao nhiêu ngỡ ngàng và e ấp dần nhường chỗ cho những tiếng cười đùa rộn rã.',
                quote: card.dataset.quote || 'Mới đó mà tụi mình đã gắn bó cùng nhau rồi!'
            };

            openPhotoModal(photoData);
        });
    });

    /* -------------------------------------------------------------
       2. ÂM THANH LẬT TRANG SÁCH & NHẠC NỀN (WEB AUDIO API)
    ------------------------------------------------------------- */
    let audioCtx = null;
    let isBgMusicPlaying = false;
    let bgOscillator = null;

    // Khởi tạo Audio Context khi người dùng tương tác lần đầu
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Tạo âm thanh Lật Trang Sột Soạt chân thực (Noise Synthesizer)
    function playPageTurnSound() {
        initAudio();
        if (!audioCtx) return;

        const bufferSize = audioCtx.sampleRate * 0.15; // 0.15s
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        noise.start();
    }

    // Xử lý Nút Bật/Tắt Nhạc Nền Lofi
    const audioBtn = document.getElementById('audio-btn');
    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            initAudio();
            isBgMusicPlaying = !isBgMusicPlaying;

            if (isBgMusicPlaying) {
                audioBtn.textContent = '⏸ Tắt Nhạc';
                audioBtn.style.backgroundColor = '#ff9aa2';
                audioBtn.style.color = '#ffffff';
            } else {
                audioBtn.textContent = '🎵 Nhạc Nền';
                audioBtn.style.backgroundColor = '#a8dadc';
                audioBtn.style.color = '#1d3557';
            }
        });
    }

    /* -------------------------------------------------------------
       3. ĐIỀU KHIỂN NÚT LẬT TRANG (PAGE NAVIGATION)
    ------------------------------------------------------------- */
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageIndicator = document.getElementById('page-indicator');

    let currentPage = 1;
    const totalPages = 4;

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updatePage();
                playPageTurnSound();
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updatePage();
                playPageTurnSound();
            }
        });
    }

    function updatePage() {
        if (pageIndicator) {
            pageIndicator.textContent = `${currentPage} / ${totalPages}`;
        }
    }
});
