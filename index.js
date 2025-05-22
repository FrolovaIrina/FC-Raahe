let timerValue = 0;
let timerInterval;
let entries = [];

function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    timerValue++;
    document.getElementById("timer").value = formatTime(timerValue);
  }, 1000);
}



function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function increment(id) {
  const input = document.getElementById(id);
  input.value = parseInt(input.value) + 1;
}

function decrement(id) {
  const input = document.getElementById(id);
  const current = parseInt(input.value);
  if (current > 0) {
    input.value = current - 1;
  }
}


function resetField(id) {
  if (id === "timer") {
    timerValue = 0;
    stopTimer();
    document.getElementById(id).value = formatTime(timerValue);
  } else {
    document.getElementById(id).value = 0;
  }
}


function saveData() {
  const data = {
    timer: formatTime(timerValue),
    touch: document.getElementById("touch").value,
    longPass: document.getElementById("longPass").value,
    shortPass: document.getElementById("shortPass").value,
    sprint: document.getElementById("sprint").value,
    feedbackDuring: document.getElementById("feedbackDuring").value,
    feedbackAfter: document.getElementById("feedbackAfter").value,
    player: document.getElementById("player").value,
    team: document.getElementById("team").value,
    date: new Date().toLocaleDateString()
  };
  entries.push(data);
  updateTeamFilter();
  renderTable(entries);
  saveToLocalStorage();
  alert("Tallennettu!");
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function renderTable(data) {
  const container = document.getElementById("tableOutput");
  if (!data.length) {
    container.innerHTML = "<p>Ei tuloksia.</p>";
    return;
  }

  let html = "<table><thead><tr>";
  html += "<th>Päivä</th><th>Joukkue</th><th>Pelaaja</th><th>Aktiivinen</th><th>Kosketukset</th><th>Lyhyet</th><th>Pitkät</th><th>Spurtit</th><th>Palaute</th></tr></thead><tbody>";

  data.forEach(e => {
    html += `<tr>
      <td>${e.date}</td>
      <td>${e.team}</td>
      <td>${e.player}</td>
      <td>${e.timer}s</td>
      <td>${e.touch}</td>
      <td>${e.shortPass}</td>
      <td>${e.longPass}</td>
      <td>${e.sprint}</td>
      <td>${e.feedbackDuring}/${e.feedbackAfter}</td>
    </tr>`;
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

function updateTeamFilter() {
  const select = document.getElementById("teamFilter");
  const teams = [...new Set(entries.map(e => e.team))];
  select.innerHTML = '<option value="">Näytä kaikki joukkueet</option>';
  teams.forEach(team => {
    const option = document.createElement("option");
    option.value = team;
    option.textContent = team;
    select.appendChild(option);
  });
}

function filterByTeam() {
  const team = document.getElementById("teamFilter").value;
  const filtered = team ? entries.filter(e => e.team === team) : entries;
  renderTable(filtered);
}

function sendLastViaWhatsApp() {
  if (!entries.length) return alert("Ei tietoja.");
  const e = entries[entries.length - 1];
  const msg = `Seuranta: ${e.player} (${e.team}) ${e.date}%0AAktiivinen: ${e.timer}s%0AKosketukset: ${e.touch}%0ALyhyt: ${e.shortPass}, Pitkä: ${e.longPass}%0ASpurtit: ${e.sprint}%0APalaute: ${e.feedbackDuring}/${e.feedbackAfter}`;
  const url = `https://wa.me/?text=${msg}`;
  window.open(url, "_blank");
}

function downloadCSV() {
  const headers = "Päivämäärä,Joukkue,Pelaaja,Aktiivinen,Kosketukset,Lyhyet syötöt,Pitkät syötöt,Spurtit,Palaute (treeni),Palaute (jälki)";
  const rows = entries.map(e =>
    [e.date, e.team, e.player, e.timer, e.touch, e.shortPass, e.longPass, e.sprint, e.feedbackDuring, e.feedbackAfter].join(",")
  );
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "seurannat.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function loadCSV(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const lines = e.target.result.split("\\n").slice(1);
    lines.forEach(line => {
      const cols = line.split(",");
      if (cols.length >= 10) {
        entries.push({
          date: cols[0],
          team: cols[1],
          player: cols[2],
          timer: cols[3],
          touch: cols[4],
          shortPass: cols[5],
          longPass: cols[6],
          sprint: cols[7],
          feedbackDuring: cols[8],
          feedbackAfter: cols[9]
        });
      }
    });
    updateTeamFilter();
    renderTable(entries);
    saveToLocalStorage();
  };
  reader.readAsText(file);
}

function saveToLocalStorage() {
  localStorage.setItem("seurantaData", JSON.stringify(entries));
}

function clearEverything() {
  if (confirm("Haluatko varmasti tyhjentää kaiken?")) {
       entries = [];
       localStorage.removeItem("seurantaData");    
    [
      "timer", "touch", "longPass", "shortPass",
      "sprint", "feedbackDuring", "feedbackAfter",
      "player", "team"
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = (id === "player" || id === "team") ? "" : "0";
    });
  
    stopTimer();
    timerValue = 0;
    
    const table = document.getElementById("tableOutput");
    if (table) table.innerHTML = "";

    alert("Kaikki tiedot tyhjennetty!");
  }
}


window.onload = function() {
  const saved = localStorage.getItem("seurantaData");
  if (saved) {
    try {
      entries = JSON.parse(saved);
      updateTeamFilter();
      renderTable(entries);
    } catch (e) {
      console.error("Virhe ladattaessa tallennettuja tietoja:", e);
    }
  }
  
}

function resetAllCounts() {
  ["touch", "shortPass", "longPass", "sprint", "feedbackDuring", "feedbackAfter"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "0";
  });

  document.getElementById("timer").value = formatTime(0);
  timerValue = 0;
  stopTimer();
}

