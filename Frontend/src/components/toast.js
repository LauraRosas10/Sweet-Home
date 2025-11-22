export function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";

  toast.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 5px;">${message}</div>
    <div class="toast-bar"></div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}
