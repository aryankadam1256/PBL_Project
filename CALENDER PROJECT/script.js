document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    // Fetch data from JSON and localStorage
    fetch("data.json")
        .then(response => response.json())
        .then(data => {
            let storedEvents = JSON.parse(localStorage.getItem("events")) || {};

            // Merge stored events with fetched data
            Object.keys(storedEvents).forEach(date => {
                if (!data[date]) {
                    data[date] = [];
                }
                data[date] = data[date].concat(storedEvents[date]);
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
                events: Object.keys(data).map(date => {
                    if (data[date] && data[date].length > 0) {
                        let eventType = data[date][0].type;
                        let eventColor = eventType === "holiday" ? "#ff4d4d" :
                            eventType === "event" ? "#3498db" :
                            eventType === "exam" ? "#f39c12" : "#2ecc71";
                        return { title: data[date][0].name, start: date, color: eventColor };
                    } else {
                        return null; // Skip dates without events
                    }
                }).filter(event => event !== null), // Filter out null events

                dateClick: function(info) {
                    window.location.href = `timetable.html?date=${info.dateStr}`;
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
