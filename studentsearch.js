document.addEventListener("DOMContentLoaded", function () {
  // Function to search tutors based on the subject, salary, and gender
  async function searchTutors() {
    const subjectInput = document
      .getElementById("subject-select")
      .value.toLowerCase()
      .trim(); // Get subject input
    const salaryInput = parseFloat(
      document.getElementById("salary-input").value.trim()
    ); // Get salary input and parse to number
    const genderInput = document
      .getElementById("tutor-gender")
      .value.toLowerCase()
      .trim(); // Get gender input
    const tutorList = document.getElementById("tutor-list"); // Container to display tutor list

    // Clear previous results
    tutorList.innerHTML = "";

    try {
      const query = `http://localhost:3000/api/tutor/search/`;

      const response = await fetch(query);

      if (response.ok) {
        let user = await response.json();
        let tutors = user.data;

        if (!subjectInput || !salaryInput || !genderInput) {
          const query = `http://localhost:3000/api/tutor/search/`;
          const response = await fetch(query);
          user = await response.json();
        } else {
          tutors = tutors.filter((t) => {
            const matchesSubject =
              !subjectInput || t.subject.toLowerCase() === subjectInput;
            const matchesSalary = !salaryInput || t.salary <= salaryInput;
            const matchesGender =
              !genderInput || t.gender.toLowerCase() === genderInput;
            return matchesSubject && matchesSalary && matchesGender;
          });
        }

        if (tutors.length > 0) {
          tutors = tutors.sort((a, b) => {
            return Object.keys(b.rating).length - Object.keys(b.rating).length;
          });
          tutors.forEach((tutor) => {
            const tutorInfo = document.createElement("div");
            tutorInfo.className = "tutor-info";
            tutorInfo.style =
              "margin: 10px 0; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9;";

            // Display all tutor details

            tutorInfo.innerHTML = `
              <strong style='color: blue;'>${tutor.name}</strong> <br>
              <strong>Email:</strong> ${tutor.email} <br>
              <strong>Department:</strong> ${tutor.department} <br>
              <strong>Subject:</strong> ${tutor.subject} <br>
              <strong>Contact:</strong> ${tutor.contact} <br>
              <strong>Salary:</strong> ${tutor.salary} <br>
              <strong>Gender:</strong> ${tutor.gender} <br>
              <strong>Rating:</strong> ${Object.keys(tutor.rating).length} <br>
              <button class="rate-button" data-tutor-id="${
                tutor._id
              }" style="margin-top: 10px; padding: 5px 10px; background-color: green; color: white; border: none; border-radius: 5px; cursor: pointer;">Rate</button>
            `;

            tutorList.appendChild(tutorInfo);
          });

          // Add event listeners to all rate buttons
          const rateButtons = document.querySelectorAll(".rate-button");
          rateButtons.forEach((button) => {
            button.addEventListener("click", async function () {
              const tutorId = this.getAttribute("data-tutor-id");
              await rateTutor(tutorId);
            });
          });
        } else {
          // If no tutors are found
          tutorList.innerHTML =
            "<p style='color: orange;'>No tutors found matching the criteria.</p>";
        }
      } else {
        // Handle errors from the server (e.g., 404 or 500)
        const errorData = await response.json();
        tutorList.innerHTML = `<p style='color: red;'>${
          errorData.error || "An error occurred while fetching tutors."
        }</p>`;
      }
    } catch (error) {
      console.error("Error fetching tutors:", error);
      tutorList.innerHTML =
        "<p style='color: red;'>There was an error fetching the tutors.</p>";
    }
  }

  // Function to rate a tutor
  async function rateTutor(tutorId) {
    try {
      const session = document.cookie.slice(8);
      const response = await fetch(`http://localhost:3000/api/tutor/rate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tutorId, session }),
      });

      if (response.ok) {
        alert("Tutor rated successfully!");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Unable to rate tutor."}`);
      }
    } catch (error) {
      console.error("Error rating tutor:", error);
      alert("An error occurred while rating the tutor.");
    }
  }

  // Attach event listener to submit button
  document
    .getElementById("submit-button")
    .addEventListener("click", searchTutors);
});
