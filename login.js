function toggleForms() {
  const roleSelect = document.getElementById("role-select");
  const studentForm = document.getElementById("student-form");
  const tutorForm = document.getElementById("tutor-form");

  if (roleSelect.value === "student") {
    studentForm.style.display = "block";
    tutorForm.style.display = "none";
  } else if (roleSelect.value === "tutor") {
    tutorForm.style.display = "block";
    studentForm.style.display = "none";
  } else {
    studentForm.style.display = "none";
    tutorForm.style.display = "none";
  }
}

async function studentLogin() {
  const email = document.getElementById("student-email").value;
  const password = document.getElementById("student-password").value;

  try {
    const response = await fetch("http://localhost:3000/login/student", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    document.cookie = `session=${data.message}`;
    if (response.ok) {
      window.location.href = "studenthome.html";
    } else {
      alert("Student login failed. Please check your credentials.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while logging in as a student.");
  }
}

async function tutorLogin() {
  const email = document.getElementById("tutor-email").value;
  const password = document.getElementById("tutor-password").value;

  try {
    const response = await fetch("http://localhost:3000/login/tutor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    document.cookie = `session=${data.message}`;
    if (response.ok) {
      window.location.href = "tutorhome.html";
    } else {
      alert("Tutor login failed. Please check your credentials.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while logging in as a tutor.");
  }
}
