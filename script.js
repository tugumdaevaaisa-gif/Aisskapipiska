// Основная функция переключения сцен
function nextScene(sceneNumber) {
    // Включение фоновой музыки при первом взаимодействии
    const music = document.getElementById('bg-music');
    if (music && music.paused) {
        music.play().catch(() => console.log("Музыка активирована"));
    }

    // Скрытие текущей сцены
    const currentScene = document.querySelector('.scene.active');
    if (currentScene) {
        currentScene.classList.remove('active');
    }

    // Активация новой сцены
    const nextSceneElement = document.getElementById(`scene-${sceneNumber}`);
    if (nextSceneElement) {
        nextSceneElement.classList.add('active');
    }

    // Проверка статуса RSVP при переходе на 5-ю сцену
    if (sceneNumber === 5 && localStorage.getItem("rsvp_submitted") === "true") {
        checkRsvpStatusOnScene5();
    }
}

// Вспомогательная функция для отображения статуса формы на 5 сцене
function checkRsvpStatusOnScene5() {
    const form = document.getElementById('rsvp-form');
    const successMessage = document.getElementById('rsvp-success');
    
    if (form && successMessage) {
        form.style.display = 'none';
        successMessage.style.display = 'block';
        
        const successTitle = successMessage.querySelector('h3');
        const successDesc = document.getElementById('success-desc');
        
        if (successTitle) successTitle.textContent = 'Вы уже оставили свой ответ!';
        if (successDesc) successDesc.textContent = 'Рады, что вы будете с нами в этот важный день.';
    }
}

// Обработка клика по кнопке "Подтвердить присутствие" из конверта
function handleEnvelopeNextClick(event) {
    if (event) event.stopPropagation();
    nextScene(5);
}

// Увеличение карточек в галерее истории
function zoomPhoto(card) {
    if (card.classList.contains('zoomed')) {
        card.classList.remove('zoomed');
    } else {
        document.querySelectorAll('.scattered-card.zoomed').forEach(c => c.classList.remove('zoomed'));
        card.classList.add('zoomed');
    }
}

// Закрытие увеличенной карточки при клике на оверлей
function closeAllPhotos() {
    document.querySelectorAll('.scattered-card.zoomed').forEach(c => c.classList.remove('zoomed'));
}

// Интерактив открытия конверта
function openEnvelope() {
    const envelope = document.getElementById('envelope');
    if (envelope) {
        envelope.classList.toggle('open');
    }
}

// Предотвращение всплытия событий для кликов внутри письма
function stopPropagation(event) {
    if (event) event.stopPropagation();
}

// Отправка формы RSVP (Web3Forms)
function sendRsvp(event) {
    event.preventDefault();
    
    const form = document.getElementById('rsvp-form');
    const successMessage = document.getElementById('rsvp-success');
    const submitButton = form.querySelector('.btn-rsvp-submit');
    
    if (localStorage.getItem("rsvp_submitted") === "true") {
        alert("Вы уже отправляли ответ с этого устройства.");
        return;
    }
    
    if (submitButton) submitButton.disabled = true;

    const formData = new FormData(form);
    formData.append("access_key", "e7d0e149-5d47-4ca0-b82c-73d5806cbdd1");
    formData.append("subject", "Новый ответ RSVP на свадьбу Максима и Дианы!");

    const drinks = [];
    form.querySelectorAll('input[name="drinks"]:checked').forEach((checkbox) => {
        drinks.push(checkbox.value);
    });
    formData.append("Выбранные напитки", drinks.length > 0 ? drinks.join(', ') : 'Не выбрано');

    fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
    })
    .then(async (response) => {
        if (response.status === 200) {
            localStorage.setItem("rsvp_submitted", "true");
            form.style.display = 'none';
            successMessage.style.display = 'block';
        } else {
            let json = await response.json();
            alert("Ошибка: " + json.message);
            if (submitButton) submitButton.disabled = false;
        }
    })
    .catch(() => {
        alert("Что-то пошло не так. Проверьте подключение к интернету.");
        if (submitButton) submitButton.disabled = false;
    });
}

// Обратный отсчет до свадьбы (12 сентября 2026, 17:00)
function initWeddingTimer() {
    const weddingDate = new Date("September 12, 2026 17:00:00").getTime();

    function updateTimer() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            clearInterval(timerInterval);
            const timerContainer = document.querySelector('.wedding-timer');
            if (timerContainer) {
                timerContainer.innerHTML = "<div class='timer-number' style='font-size: 1.5rem;'>Этот счастливый день настал! 🥂</div>";
            }
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const daysEl = document.getElementById("timer-days");
        const hoursEl = document.getElementById("timer-hours");
        const minutesEl = document.getElementById("timer-minutes");
        const secondsEl = document.getElementById("timer-seconds");

        if (daysEl) daysEl.textContent = days < 10 ? "0" + days : days;
        if (hoursEl) hoursEl.textContent = hours < 10 ? "0" + hours : hours;
        if (minutesEl) minutesEl.textContent = minutes < 10 ? "0" + minutes : minutes;
        if (secondsEl) secondsEl.textContent = seconds < 10 ? "0" + seconds : seconds;
    }

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
}

// Инициализация при загрузке DOM
document.addEventListener("DOMContentLoaded", function() {
    initWeddingTimer();

    // Проверка статуса RSVP при первой загрузке
    if (localStorage.getItem("rsvp_submitted") === "true") {
        checkRsvpStatusOnScene5();
    }
});
