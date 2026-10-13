
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const output = document.getElementById("output");
const language = document.getElementById("language");
const status = document.getElementById("status");

const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const clearBtn = document.getElementById("clearBtn");

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition;
let isListening = false;
let finalText = "";

if (!SpeechRecognition) {
    startBtn.disabled = true;
    status.textContent =
        "Speech recognition is not supported in this browser.";
} else {
    recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language.value;

    recognition.onstart = function () {
        isListening = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        language.disabled = true;
        status.textContent = "🎙️ Listening... Speak now!";
    };

    recognition.onresult = function (event) {
        let interimText = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                finalText += transcript + " ";
            } else {
                interimText += transcript;
            }
        }

        output.value = finalText + interimText;
    };

    recognition.onerror = function (event) {
        const messages = {
            "not-allowed": "Please allow microphone access.",
            "no-speech": "No speech detected. Try speaking again.",
            "audio-capture": "No microphone was found.",
            "network": "A network error occurred."
        };

        status.textContent =
            messages[event.error] || "Error: " + event.error;
    };

    recognition.onend = function () {
        isListening = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        language.disabled = false;

        if (status.textContent === "🎙️ Listening... Speak now!") {
            status.textContent = "Recording stopped.";
        }
    };
}

startBtn.addEventListener("click", function () {
    if (!recognition || isListening) return;

    recognition.lang = language.value;
    finalText = output.value;

    if (finalText.trim() !== "") {
        finalText += " ";
    }

    try {
        recognition.start();
    } catch (error) {
        status.textContent = "Unable to start. Please try again.";
    }
});

stopBtn.addEventListener("click", function () {
    if (recognition && isListening) {
        recognition.stop();
    }
});

language.addEventListener("change", function () {
    if (recognition) {
        recognition.lang = language.value;
    }
});

copyBtn.addEventListener("click", async function () {
    if (!output.value.trim()) {
        status.textContent = "There is no text to copy.";
        return;
    }

    try {
        await navigator.clipboard.writeText(output.value);
        status.textContent = "Text copied successfully!";
    } catch (error) {
        output.select();
        status.textContent = "Please copy the selected text manually.";
    }
});

downloadBtn.addEventListener("click", function () {
    if (!output.value.trim()) {
        status.textContent = "There is no text to download.";
        return;
    }

    const blob = new Blob(
        [output.value],
        { type: "text/plain;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "voice-to-text.txt";
    link.click();

    URL.revokeObjectURL(url);
    status.textContent = "Text file downloaded!";
});

clearBtn.addEventListener("click", function () {
    output.value = "";
    finalText = "";
    status.textContent = isListening
        ? "🎙️ Listening... Speak now!"
        : "Ready to listen";
});
