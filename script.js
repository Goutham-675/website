const tabButtons = document.querySelectorAll(".side-tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

const calendarGrid = document.getElementById("calendarGrid");
const monthLabel = document.getElementById("calendarMonthLabel");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

const journalForm = document.getElementById("journalForm");
const entryDateInput = document.getElementById("entryDate");
const entryTitleInput = document.getElementById("entryTitle");
const entryTextInput = document.getElementById("entryText");
const entriesList = document.getElementById("entriesList");
const selectedDateLabel = document.getElementById("selectedDateLabel");

const STORAGE_KEY = "goutham_portfolio_journal_entries";

let entriesByDate = loadEntries();
let selectedDate = toISODate(new Date());
let currentMonthDate = new Date();
currentMonthDate.setDate(1);
const hasJournalUI =
  calendarGrid &&
  monthLabel &&
  prevMonthBtn &&
  nextMonthBtn &&
  journalForm &&
  entryDateInput &&
  entryTitleInput &&
  entryTextInput &&
  entriesList &&
  selectedDateLabel;

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;

    tabButtons.forEach((item) => item.classList.remove("active"));
    tabContents.forEach((item) => item.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(target).classList.add("active");
  });
});

if (hasJournalUI) {
  prevMonthBtn.addEventListener("click", () => {
    currentMonthDate = new Date(
      currentMonthDate.getFullYear(),
      currentMonthDate.getMonth() - 1,
      1
    );
    renderCalendar();
  });

  nextMonthBtn.addEventListener("click", () => {
    currentMonthDate = new Date(
      currentMonthDate.getFullYear(),
      currentMonthDate.getMonth() + 1,
      1
    );
    renderCalendar();
  });

  journalForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const date = entryDateInput.value;
    const title = entryTitleInput.value.trim();
    const text = entryTextInput.value.trim();

    if (!date || !title || !text) {
      return;
    }

    const nextEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      text,
      createdAt: new Date().toISOString(),
    };

    if (!entriesByDate[date]) {
      entriesByDate[date] = [];
    }
    entriesByDate[date].unshift(nextEntry);

    saveEntries(entriesByDate);

    selectedDate = date;
    entryTitleInput.value = "";
    entryTextInput.value = "";

    renderCalendar();
    renderEntriesForSelectedDate();
  });
}

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function toISODate(date) {
  return date.toISOString().split("T")[0];
}

function humanDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderCalendar() {
  calendarGrid.innerHTML = "";

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  monthLabel.textContent = currentMonthDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  weekdays.forEach((day) => {
    const cell = document.createElement("div");
    cell.className = "weekday";
    cell.textContent = day;
    calendarGrid.appendChild(cell);
  });

  const firstDayWeekIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  for (let i = firstDayWeekIndex - 1; i >= 0; i -= 1) {
    const dayNum = daysInPrevMonth - i;
    const dateString = toISODate(new Date(year, month - 1, dayNum));
    calendarGrid.appendChild(dayButton(dayNum, dateString, true));
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateString = toISODate(new Date(year, month, day));
    calendarGrid.appendChild(dayButton(day, dateString, false));
  }

  const totalCellsUsed = firstDayWeekIndex + daysInMonth;
  const nextMonthDays = (7 - (totalCellsUsed % 7)) % 7;
  for (let day = 1; day <= nextMonthDays; day += 1) {
    const dateString = toISODate(new Date(year, month + 1, day));
    calendarGrid.appendChild(dayButton(day, dateString, true));
  }
}

function dayButton(dayNum, dateString, isOtherMonth) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "day";
  btn.textContent = dayNum;

  if (isOtherMonth) {
    btn.classList.add("other-month");
  }
  if (entriesByDate[dateString] && entriesByDate[dateString].length > 0) {
    btn.classList.add("has-entry");
  }
  if (selectedDate === dateString) {
    btn.classList.add("selected");
  }

  btn.addEventListener("click", () => {
    selectedDate = dateString;
    entryDateInput.value = selectedDate;

    currentMonthDate = new Date(
      new Date(`${dateString}T00:00:00`).getFullYear(),
      new Date(`${dateString}T00:00:00`).getMonth(),
      1
    );

    renderCalendar();
    renderEntriesForSelectedDate();
  });

  return btn;
}

function renderEntriesForSelectedDate() {
  selectedDateLabel.textContent = `Selected: ${humanDate(selectedDate)}`;
  entriesList.innerHTML = "";

  const entries = entriesByDate[selectedDate] || [];

  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-entries";
    empty.textContent = "No entries yet for this date.";
    entriesList.appendChild(empty);
    return;
  }

  entries.forEach((entry) => {
    const wrapper = document.createElement("article");
    wrapper.className = "entry";

    const title = document.createElement("h4");
    title.textContent = entry.title;

    const content = document.createElement("p");
    content.textContent = entry.text;

    wrapper.appendChild(title);
    wrapper.appendChild(content);
    entriesList.appendChild(wrapper);
  });
}

if (hasJournalUI) {
  entryDateInput.value = selectedDate;
  renderCalendar();
  renderEntriesForSelectedDate();
}
