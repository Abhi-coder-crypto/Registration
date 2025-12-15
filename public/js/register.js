document.getElementById("regForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(e.target));

  const res = await fetch("/.netlify/functions/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (result.success) {
    alert("🎉 You have registered successfully!");
    e.target.reset();
  } else {
    alert("❌ Registration failed. Please try again.");
  }
});
