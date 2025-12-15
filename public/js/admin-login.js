async function login() {
  const res = await fetch("/.netlify/functions/adminLogin", {
    method: "POST",
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });

  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    location.href = "admin-dashboard.html";
  } else {
    alert("Invalid credentials");
  }
}
