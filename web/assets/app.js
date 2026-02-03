const api = (path, opts) => fetch(path, opts).then((r) => r.json());

const studentSelect = document.getElementById("student-select");
const teacherSelect = document.getElementById("teacher-select");
const subjectSelect = document.getElementById("subject-select");

const filterStudent = document.getElementById("filter-student");
const filterTeacher = document.getElementById("filter-teacher");
const filterSubject = document.getElementById("filter-subject");

const feedback = document.getElementById("form-feedback");
const examsTable = document.getElementById("exams-table");
const avgTable = document.getElementById("avg-table");

function option(value, label) {
  const opt = document.createElement("option");
  opt.value = value;
  opt.textContent = label;
  return opt;
}

function resetSelect(select, placeholder) {
  select.innerHTML = "";
  select.appendChild(option("", placeholder));
}

function renderTable(container, headers, rows, formatter) {
  container.innerHTML = "";
  
  const headerRow = document.createElement("div");
  headerRow.className = "row header";
  headers.forEach((h) => {
    const cell = document.createElement("div");
    cell.textContent = h;
    headerRow.appendChild(cell);
  });
  container.appendChild(headerRow);

  if (!rows.length) {
    const empty = document.createElement("div");
    empty.className = "row";
    empty.style.textAlign = "center";
    empty.style.color = "var(--color-text-muted)";
    empty.style.gridColumn = "1 / -1";
    empty.textContent = "Nessun dato disponibile";
    container.appendChild(empty);
    return;
  }

  rows.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "row";
    const values = formatter(row);
    values.forEach((value, idx) => {
      const cell = document.createElement("div");
      cell.textContent = value;
      cell.setAttribute('data-label', headers[idx] + ':');
      rowEl.appendChild(cell);
    });
    container.appendChild(rowEl);
  });
}

async function loadOptions() {
  const [students, teachers, subjects] = await Promise.all([
    api("/api/students"),
    api("/api/teachers"),
    api("/api/subjects"),
  ]);

  resetSelect(studentSelect, "Seleziona studente");
  resetSelect(teacherSelect, "Seleziona docente");
  resetSelect(subjectSelect, "Seleziona materia");
  resetSelect(filterStudent, "Tutti");
  resetSelect(filterTeacher, "Tutti");
  resetSelect(filterSubject, "Tutte");

  students.forEach((s) => {
    const label = `${s.Cognome} ${s.Nome} (${s.Matricola})`;
    studentSelect.appendChild(option(s.Matricola, label));
    filterStudent.appendChild(option(s.Matricola, label));
  });

  teachers.forEach((d) => {
    const label = `${d.Cognome} ${d.Nome}`;
    teacherSelect.appendChild(option(d.IdDocente, label));
    filterTeacher.appendChild(option(d.IdDocente, label));
  });

  subjects.forEach((m) => {
    const label = `${m.Nome} (${m.CFU} CFU)`;
    subjectSelect.appendChild(option(m.IdMateria, label));
    filterSubject.appendChild(option(m.IdMateria, label));
  });
}

async function createExam(event) {
  event.preventDefault();
  feedback.textContent = "";

  const payload = {
    Matricola: studentSelect.value,
    IdDocente: teacherSelect.value,
    IdMateria: subjectSelect.value,
    DataEsame: document.getElementById("exam-date").value,
    Voto: document.getElementById("exam-grade").value,
    Lode: document.getElementById("exam-lode").checked,
  };

  const res = await fetch("/api/exams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    feedback.textContent = data.error || "Errore durante l'inserimento";
    feedback.style.color = "#991b1b";
    return;
  }

  feedback.textContent = "✓ Esame registrato";
  feedback.style.color = "#15803d";
  event.target.reset();
  
  setTimeout(() => {
    feedback.textContent = "";
  }, 3000);
  
  await loadExams();
  await loadAverages();
}

async function loadExams() {
  const params = new URLSearchParams();
  if (filterStudent.value) params.append("Matricola", filterStudent.value);
  if (filterTeacher.value) params.append("IdDocente", filterTeacher.value);
  if (filterSubject.value) params.append("IdMateria", filterSubject.value);

  const exams = await api(`/api/exams?${params.toString()}`);

  renderTable(
    examsTable,
    ["Studente", "Materia", "Docente", "Data", "Voto", "Lode"],
    exams,
    (e) => [
      `${e.CognomeStudente} ${e.NomeStudente}`,
      e.NomeMateria,
      `${e.CognomeDocente} ${e.NomeDocente}`,
      e.DataEsame,
      e.Voto,
      e.Lode ? "Si" : "No",
    ]
  );
}

async function loadAverages() {
  const averages = await api("/api/averages");

  renderTable(
    avgTable,
    ["Studente", "Matricola", "Media Pesata", "CFU"],
    averages,
    (a) => [
      `${a.Cognome} ${a.Nome}`,
      a.Matricola,
      a.MediaPesata ?? "-",
      a.CFUTotali ?? "0",
    ]
  );
}


document.getElementById("exam-form").addEventListener("submit", createExam);
document.getElementById("filter-btn").addEventListener("click", loadExams);
document.getElementById("avg-btn").addEventListener("click", loadAverages);

loadOptions().then(() => {
  loadExams();
  loadAverages();
});
