// 🔐 Protect dashboard
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "admin-login.html";
}

// 📊 Load registrations
async function load() {
  try {
    const res = await fetch("/.netlify/functions/getRegistrations", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Unauthorized");
    }

    const data = await res.json();

    let html = "<tr><th>Name</th><th>Email</th><th>Mobile</th></tr>";
    data.forEach(r => {
      html += `
        <tr>
          <td>${r.name}</td>
          <td>${r.email}</td>
          <td>${r.mobile}</td>
        </tr>`;
    });

    document.getElementById("data").innerHTML = html;
  } catch (err) {
    localStorage.removeItem("token");
    window.location.href = "admin-login.html";
  }
}

// ⬇ Excel download
function download() {
  window.open("/.netlify/functions/exportExcel?token=" + token);
}

// 🚪 Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "admin-login.html";
});

// 🚀 Init
load();
