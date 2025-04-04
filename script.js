document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    // Fetch data from JSON and localStorage
    fetch("data.json")
        .then(response => response.json())
        .then(data => {
            let storedEvents = JSON.parse(localStorage.getItem("events")) || {};
            let storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

            // Merge stored events with fetched data
            Object.keys(storedEvents).forEach(date => {
                if (!data[date]) {
                    data[date] = [];
                }
                data[date] = data[date].concat(storedEvents[date]);
            });

            // Convert tasks into event format
            storedTasks.forEach(task => {
                if (!data[task.date]) {
                    data[task.date] = [];
                }
                data[task.date].push({ type: "task", name: task.text });
            });

            // Initialize FullCalendar
            var calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                selectable: true,
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                events: Object.keys(data).flatMap(date => {
                    return data[date].map(entry => ({
                        title: entry.name,
                        start: date,
                        color: entry.type === "holiday" ? "#ff4d4d" :
                               entry.type === "event" ? "#3498db" :
                               entry.type === "exam" ? "#f39c12" : "#2ecc71"
                    }));
                }),

                dateClick: function(info) {
                    const selectedDate = info.dateStr;
                    const tasksForDate = storedTasks.filter(task => task.date === selectedDate);

                    if (tasksForDate.length > 0) {
                        alert(`Tasks for ${selectedDate}:\n` + tasksForDate.map(task => `- ${task.text}`).join('\n'));
                    } else {
                        alert(`No tasks for ${selectedDate}.`);
                    }
                }
            });

            calendar.render();
        });

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    // Apply saved dark mode state
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Update "Today" functionality
    const todayButton = document.getElementById('todayButton');
    todayButton.addEventListener('click', function () {
        const today = new Date().toISOString().split('T')[0];
        window.location.href = `timetable.html?date=${today}`;
    });

    // Voice Control
    const voiceButton = document.getElementById("voiceButton");
    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";

    voiceButton.addEventListener("click", function() {
        voiceButton.textContent = "🎤 Listening...";
        recognition.start();
    });

    recognition.onresult = function(event) {
        let command = event.results[0][0].transcript.toLowerCase();
        let match = command.match(/(january|february|march|april|may|june|july|august|september|october|november|december) (\d+)/);
        if (match) {
            let month = match[1];
            let day = match[2];
            let year = new Date().getFullYear();
            let dateStr = `${year}-${getMonthNumber(month)}-${day.padStart(2, '0')}`;
            window.location.href = `timetable.html?date=${dateStr}`;
        } else {
            alert("❌ Couldn't recognize the date. Try saying: 'Show timetable for February 5'");
        }
        voiceButton.textContent = "🎙️ Click & Speak";
    };

    function getMonthNumber(month) {
        return new Date(`${month} 1, 2025`).getMonth() + 1; // Convert month name to number
    }
});