document.addEventListener('DOMContentLoaded', () => {
    const introScreen = document.getElementById('intro-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const questionContainer = document.getElementById('question-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitQuizBtn = document.getElementById('submit-quiz-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const finalScoreDisplay = document.getElementById('final-score');
    const resultMessageDiv = document.getElementById('result-message');
    const recommendationList = document.getElementById('recommendation-list');
    const restartQuizBtn = document.getElementById('restart-quiz-btn');
    const saveDataBtn = document.getElementById('save-data-btn');

    let currentQuestionIndex = 0;
    let userAnswers = {};

    const questions = [
        {
            id: 'q1',
            question: 'Usia Anda saat ini?',
            type: 'radio',
            options: [
                { text: 'Di bawah 40 tahun', value: 0 },
                { text: '40-49 tahun', value: 1 },
                { text: '50-59 tahun', value: 2 },
                { text: '60 tahun ke atas', value: 3 }
            ]
        },
        {
            id: 'q2',
            question: 'Apakah Anda seorang pria atau wanita?',
            type: 'radio',
            options: [
                { text: 'Pria', value: 'Pria', points: 1 },
                { text: 'Wanita', value: 'Wanita', points: 0 }
            ]
        },
        {
            id: 'q3',
            question: 'Apakah keluarga Anda pernah didiagnosis diabetes?',
            type: 'radio',
            options: [
                { text: 'Ya', value: 1 },
                { text: 'Tidak', value: 0 }
            ]
        },
        {
            id: 'q4',
            question: 'Pernahkah Anda didiagnosis hipertensi?',
            type: 'radio',
            options: [
                { text: 'Ya', value: 1 },
                { text: 'Tidak', value: 0 }
            ]
        },
        {
            id: 'q5',
            question: 'Apakah Anda aktif secara fisik?',
            type: 'radio',
            options: [
                { text: 'Tidak pernah atau jarang', value: 1 },
                { text: 'Aktif 30 menit, 5 hari/minggu', value: 0 }
            ]
        },
        {
            id: 'q6',
            question: 'Pernahkah Anda mengalami diabetes saat hamil?',
            type: 'radio',
            options: [
                { text: 'Ya', value: 1 },
                { text: 'Tidak', value: 0 }
            ],
            condition: (answers) => answers['q2'] === 'Wanita'
        },
        {
            id: 'q7',
            question: 'Apakah anda pernah /sering Merokok?',
            type: 'radio',
            options: [
                { text: 'Ya', value: 1 },
                { text: 'Tidak', value: 0 }
            ]
        },
        {
            id: 'q8',
            question: 'Berapa Riwayat gula darah terakhir Kamu?',
            type: 'radio',
            options: [
                { text: '<200 mg/dl', value: 0 },
                { text: '>200 mg/dl', value: 1 }
            ]
        },
        {
            id: 'q9',
            question: 'Berapa Indeks Massa Tubuh (IMT) Anda?',
            type: 'imt',
            options: [
                { text: 'IMT kurang dari 25', minIMT: 0, maxIMT: 24.9, value: 0 },
                { text: 'IMT 25 - 29.9', minIMT: 25, maxIMT: 29.9, value: 1 },
                { text: 'IMT 30 atau lebih', minIMT: 30, maxIMT: Infinity, value: 2 }
            ]
        }
    ];

    function getFilteredQuestions() {
        return questions.filter(q => !q.condition || q.condition(userAnswers));
    }

    function updateProgressBar() {
        const filteredQuestions = getFilteredQuestions();
        const totalQuestions = filteredQuestions.length;
        const progress = (currentQuestionIndex / totalQuestions) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}% Selesai`;
    }

    function renderQuestion() {
        const filteredQuestions = getFilteredQuestions();
        if (currentQuestionIndex >= filteredQuestions.length) {
            showResult();
            return;
        }

        const question = filteredQuestions[currentQuestionIndex];
        questionContainer.innerHTML = '';

        let html = `<div class="question-item"><h3>${question.question}</h3>`;

        if (question.type === 'radio') {
            html += '<div class="options">';
            question.options.forEach(option => {
                const checked = userAnswers[question.id] === option.value ? 'checked' : '';
                html += `
                    <label class="option-label">
                        <input type="radio" name="${question.id}" value="${option.value}" ${checked}>
                        ${option.text}
                    </label>`;
            });
            html += '</div>';
        } else if (question.type === 'imt') {
            const storedHeight = localStorage.getItem('userHeight') || '';
            const storedWeight = localStorage.getItem('userWeight') || '';
            html += `
                <div class="input-group">
                    <label for="height">Tinggi Badan (cm):</label>
                    <input type="number" id="height" value="${storedHeight}">
                    <label for="weight">Berat Badan (kg):</label>
                    <input type="number" id="weight" value="${storedWeight}">
                    <button id="calculate-imt-btn" class="btn secondary">Hitung IMT</button>
                    <p id="imt-display">IMT Anda: -</p>
                </div>
            `;
        }

        html += '</div>';
        questionContainer.innerHTML = html;

        if (question.type === 'imt') {
            document.getElementById('calculate-imt-btn').addEventListener('click', calculateIMTAndDisplay);
        }

        updateNavigationButtons();
        updateProgressBar();
    }

    function calculateIMTAndDisplay() {
        const height = parseFloat(document.getElementById('height').value);
        const weight = parseFloat(document.getElementById('weight').value);
        const imtDisplay = document.getElementById('imt-display');
        const question = getFilteredQuestions()[currentQuestionIndex];

        if (height > 0 && weight > 0) {
            const imt = weight / ((height / 100) ** 2);
            imtDisplay.textContent = `IMT Anda: ${imt.toFixed(2)}`;

            for (const option of question.options) {
                if (imt >= option.minIMT && imt <= option.maxIMT) {
                    userAnswers[question.id] = option.value;
                    break;
                }
            }

            localStorage.setItem('userHeight', height);
            localStorage.setItem('userWeight', weight);
        } else {
            imtDisplay.textContent = 'Masukkan tinggi dan berat yang valid.';
        }
    }

    function updateNavigationButtons() {
        const filteredQuestions = getFilteredQuestions();
        prevBtn.style.display = currentQuestionIndex > 0 ? 'inline-block' : 'none';
        nextBtn.style.display = currentQuestionIndex < filteredQuestions.length - 1 ? 'inline-block' : 'none';
        submitQuizBtn.style.display = currentQuestionIndex === filteredQuestions.length - 1 ? 'inline-block' : 'none';
    }

    function saveAnswer() {
        const filteredQuestions = getFilteredQuestions();
        const question = filteredQuestions[currentQuestionIndex];

        if (question.type === 'radio') {
            const selected = document.querySelector(`input[name="${question.id}"]:checked`);
            if (selected) {
                userAnswers[question.id] = isNaN(selected.value) ? selected.value : parseInt(selected.value);
            }
        }
    }

    function showNextQuestion() {
        saveAnswer();
        const filteredQuestions = getFilteredQuestions();
        const question = filteredQuestions[currentQuestionIndex];

        if (typeof userAnswers[question.id] === 'undefined') {
            alert("Mohon lengkapi jawaban terlebih dahulu.");
            return;
        }

        currentQuestionIndex++;
        renderQuestion();
    }

    function showPreviousQuestion() {
        saveAnswer();
        currentQuestionIndex--;
        renderQuestion();
    }

    function calculateScore() {
        let score = 0;
        for (const q of questions) {
            if (userAnswers[q.id] !== undefined) {
                if (q.id === 'q2') {
                    const opt = q.options.find(o => o.value === userAnswers[q.id]);
                    score += opt?.points ?? 0;
                } else {
                    score += userAnswers[q.id];
                }
            }
        }
        return score;
    }

    function showResult() {
        const score = calculateScore();
        finalScoreDisplay.textContent = score;

        let message = '';
        let className = '';
        let tips = '';

        if (score <= 2) {
            message = 'Risiko rendah terkena diabetes tipe 2.';
            className = 'low';
            tips = '<li>Jaga pola makan dan gaya hidup sehat.</li>';
        } else if (score <= 5) {
            message = 'Ada beberapa faktor risiko yang perlu diperhatikan.';
            className = 'medium';
            tips = '<li>Konsultasi dengan dokter disarankan.</li>';
        } else {
            message = 'Risiko tinggi terkena diabetes tipe 2.';
            className = 'high';
            tips = '<li>Periksa ke dokter sesegera mungkin.</li>';
        }

        resultMessageDiv.className = `result-message ${className}`;
        resultMessageDiv.innerHTML = `<p>${message}</p>`;
        recommendationList.innerHTML = tips;

        quizScreen.classList.remove('active');
        quizScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');
        resultScreen.classList.add('active');
    }

    function resetQuiz() {
        currentQuestionIndex = 0;
        userAnswers = {};
        localStorage.removeItem('userHeight');
        localStorage.removeItem('userWeight');
        renderQuestion();
        resultScreen.classList.remove('active');
        resultScreen.classList.add('hidden');
        introScreen.classList.remove('hidden');
        introScreen.classList.add('active');
    }

    startQuizBtn.addEventListener('click', () => {
        introScreen.classList.remove('active');
        introScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');
        quizScreen.classList.add('active');
        renderQuestion();
    });

    nextBtn.addEventListener('click', showNextQuestion);
    prevBtn.addEventListener('click', showPreviousQuestion);
    submitQuizBtn.addEventListener('click', showResult);
    restartQuizBtn.addEventListener('click', resetQuiz);

    // ✅ Fitur Simpan ke localStorage & Kirim ke Server (PHP)
    saveDataBtn.addEventListener('click', () => {
        const score = calculateScore();
        const entry = {
            timestamp: new Date().toISOString(),
            answers: userAnswers,
            score: score
        };

        // Simpan ke localStorage
        const local = JSON.parse(localStorage.getItem('savedQuizData') || '[]');
        local.push(entry);
        localStorage.setItem('savedQuizData', JSON.stringify(local));

        // Kirim ke server PHP (ubah URL sesuai domain hosting IDCloudHost kamu)
        fetch('http://sugarmates.web.id/save.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        })
        .then(res => res.json())
        .then(data => {
            console.log('Response:', data);
            alert(data.message || "Data berhasil dikirim ke server.");
        })
        .catch(err => {
            console.error('Fetch error:', err);
            alert("Gagal mengirim data ke server.");
        });

    });
});
