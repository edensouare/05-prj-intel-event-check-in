const checkInForm = document.getElementById("checkInForm");
const attendeeName = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const celebration = document.getElementById("celebration");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const attendeeList = document.getElementById("attendeeList");
const emptyRoster = document.getElementById("emptyRoster");

let totalAttendees = 0;
let checkedInNames = [];
let attendeeRecords = [];

const savedAttendance = localStorage.getItem("intelSummitAttendance");
if (savedAttendance !== null) {
  try {
    const attendanceData = JSON.parse(savedAttendance);
    totalAttendees = Number(attendanceData.totalAttendees) || 0;
    checkedInNames = Array.isArray(attendanceData.checkedInNames)
      ? attendanceData.checkedInNames
      : [];
    for (let index = 0; index < checkedInNames.length; index++) {
      checkedInNames[index] = String(checkedInNames[index])
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
    }
    attendeeRecords = Array.isArray(attendanceData.attendeeRecords)
      ? attendanceData.attendeeRecords
      : [];
    document.getElementById("waterCount").textContent =
      Number(attendanceData.waterCount) || 0;
    document.getElementById("zeroCount").textContent =
      Number(attendanceData.zeroCount) || 0;
    document.getElementById("powerCount").textContent =
      Number(attendanceData.powerCount) || 0;
  } catch (error) {
    totalAttendees = 0;
    checkedInNames = [];
  }
}

attendeeCount.textContent = totalAttendees;
progressBar.style.width = `${Math.min((totalAttendees / 50) * 100, 100)}%`;

function renderAttendee(attendee) {
  const listItem = document.createElement("li");
  const nameLabel = document.createElement("span");
  const teamLabel = document.createElement("span");

  listItem.className = `attendee-row ${attendee.teamKey}`;
  nameLabel.className = "attendee-name";
  nameLabel.textContent = attendee.name;
  teamLabel.className = "attendee-team";
  teamLabel.textContent = attendee.teamName;
  listItem.appendChild(nameLabel);
  listItem.appendChild(teamLabel);
  attendeeList.appendChild(listItem);
  emptyRoster.style.display = "none";
}

for (let index = 0; index < attendeeRecords.length; index++) {
  renderAttendee(attendeeRecords[index]);
}

function showCelebration() {
  const waterCount = Number(document.getElementById("waterCount").textContent);
  const zeroCount = Number(document.getElementById("zeroCount").textContent);
  const powerCount = Number(document.getElementById("powerCount").textContent);
  let highestTeamCount = waterCount;
  let winningTeams = "Team Water Wise";

  if (zeroCount > highestTeamCount) {
    highestTeamCount = zeroCount;
    winningTeams = "Team Net Zero";
  } else if (zeroCount === highestTeamCount) {
    winningTeams += " and Team Net Zero";
  }

  if (powerCount > highestTeamCount) {
    winningTeams = "Team Renewables";
  } else if (powerCount === highestTeamCount) {
    winningTeams += " and Team Renewables";
  }

  celebration.innerHTML = `Attendance goal reached! Highest turnout: <strong>${winningTeams}</strong>.`;
  celebration.style.display = "block";
}

function saveAttendance() {
  const attendanceData = {
    totalAttendees: totalAttendees,
    checkedInNames: checkedInNames,
    attendeeRecords: attendeeRecords,
    waterCount: Number(document.getElementById("waterCount").textContent),
    zeroCount: Number(document.getElementById("zeroCount").textContent),
    powerCount: Number(document.getElementById("powerCount").textContent),
  };

  localStorage.setItem("intelSummitAttendance", JSON.stringify(attendanceData));
}

if (totalAttendees >= 50) {
  showCelebration();
}

checkInForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = attendeeName.value.trim().replace(/\s+/g, " ");
  const selectedTeam = teamSelect.value;
  let teamCount;
  let teamName;

  if (selectedTeam === "water") {
    teamCount = document.getElementById("waterCount");
    teamName = "Team Water Wise";
  } else if (selectedTeam === "zero") {
    teamCount = document.getElementById("zeroCount");
    teamName = "Team Net Zero";
  } else if (selectedTeam === "power") {
    teamCount = document.getElementById("powerCount");
    teamName = "Team Renewables";
  }

  if (name === "" || !teamCount) {
    return;
  }

  if (name.split(" ").length < 2) {
    greeting.textContent = "Please enter both your first and last name.";
    greeting.classList.remove("success-message", "duplicate-message");
    greeting.classList.add("error-message");
    greeting.style.display = "block";
    return;
  }

  const normalizedName = name.toLowerCase();
  if (checkedInNames.indexOf(normalizedName) !== -1) {
    greeting.textContent = `You have already checked in, ${name}.`;
    greeting.classList.remove("success-message", "error-message");
    greeting.classList.add("duplicate-message");
    greeting.style.display = "block";
    return;
  }

  checkedInNames.push(normalizedName);
  const attendee = {
    name: name,
    teamName: teamName,
    teamKey: selectedTeam,
  };
  attendeeRecords.push(attendee);
  renderAttendee(attendee);

  totalAttendees++;
  teamCount.textContent = Number(teamCount.textContent) + 1;
  attendeeCount.textContent = totalAttendees;
  progressBar.style.width = `${Math.min((totalAttendees / 50) * 100, 100)}%`;
  saveAttendance();

  if (totalAttendees === 50) {
    showCelebration();
  }

  greeting.textContent = `Welcome, ${name}! Thanks for joining ${teamName}.`;
  greeting.classList.remove("duplicate-message", "error-message");
  greeting.classList.add("success-message");
  greeting.style.display = "block";

  checkInForm.reset();
  attendeeName.focus();
});
