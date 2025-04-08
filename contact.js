
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  
  // Add an event listener for the form submission
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value;

    // Simulate sending data to the admin panel (you can replace this with actual AJAX request)
    console.log("Form Submitted:", {
      name: name,
      email: email,
      subject: subject,
      message: message
    });

    // Display success message
    alert("Form submitted successfully!");

    // Optionally, reset the form fields after submission
    form.reset();
  });
});