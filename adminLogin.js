async function adminLogin() {
  const email = document.getElementById("admin-email").value;
  const password = document.getElementById("admin-password").value;

  try {
    const response = await fetch("http://localhost:3000/login/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    document.cookie = `session=${data.message}`;
    if (response.ok) {
      window.location.href = "admin.html";
    } else {
      alert("Admin login failed. Please check your credentials.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while logging in as a admin.");
  }
}
