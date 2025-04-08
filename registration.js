document.getElementById("student-button").addEventListener("click", async () => {
  const first_name = document.getElementById("student-first-name").value.trim();
  const last_name = document.getElementById("student-last-name").value.trim();
  const email = document.getElementById("student-email").value.trim();
  const password = document.getElementById("student-password").value.trim();
  const contact = document.getElementById("student-contact").value.trim();

  if (!first_name || !last_name || !email || !password || !contact) {
    alert("All fields are required!");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/registration/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name, last_name, email, password, contact }),
    });

    if (response.ok) {
      alert("Student registration successful!");
      window.location = "login.html";
    } else {
      const result = await response.json();
      alert(`Error: ${result.error || "Failed to register student."}`);
    }
  } catch (error) {
    alert("Network error. Please try again later.");
    console.error("Error during student registration:", error);
  }
});

document.getElementById("tutor-button").addEventListener("click", async () => {
  const name = document.getElementById("tutor-name").value.trim();
  const email = document.getElementById("tutor-email").value.trim();
  const password = document.getElementById("tutor-password").value.trim();
  const department = document.getElementById("tutor-department").value.trim();
  const subject = document.getElementById("tutor-specialized").value.trim();
  const contact = document.getElementById("tutor-contact").value.trim();
  const salary = parseFloat(document.getElementById("tutor-salary").value.trim());
  const gender = document.getElementById("tutor-gender").value;

  if (!name || !email || !password || !department || !subject || !contact || isNaN(salary) || !gender) {
    alert("All fields are required!");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/registration/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, department, subject, contact, salary, gender }),
    });

    if (response.ok) {
      alert("Tutor registration successful!");
      window.location = "login.html";
    } else {
      const result = await response.json();
      alert(`Error: ${result.error || "Failed to register tutor."}`);
    }
  } catch (error) {
    alert("Network error. Please try again later.");
    console.error("Error during tutor registration:", error);
  }
});

function toggleForms() {
  const studentForm = document.getElementById("student-form");
  const tutorForm = document.getElementById("tutor-form");
  const role = document.getElementById("role-select").value;

  studentForm.style.display = role === "student" ? "block" : "none";
  tutorForm.style.display = role === "tutor" ? "block" : "none";
}
