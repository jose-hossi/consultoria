const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("[data-page]");
const nav = document.getElementById("mainNav");
const menuToggle = document.getElementById("menuToggle");
const toast = document.getElementById("toast");

document.getElementById("year").textContent = new Date().getFullYear();

function showPage(id) {
  pages.forEach(p => p.classList.toggle("active", p.id === id));
  navLinks.forEach(a => a.classList.toggle("active", a.dataset.page === id));
  nav.classList.remove("open");
  window.scrollTo({top: 0, behavior: "smooth"});
  if (id === "admin") updateAdmin();
}

navLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const id = link.dataset.page;
    history.replaceState(null, "", "#" + id);
    showPage(id);
  });
});

menuToggle.addEventListener("click", () => nav.classList.toggle("open"));

const startPage = location.hash.replace("#", "") || "inicio";
showPage(document.getElementById(startPage) ? startPage : "inicio");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

function saveRecord(type, form) {
  const data = Object.fromEntries(new FormData(form).entries());
  data.data = new Date().toLocaleString("pt-AO");
  const records = JSON.parse(localStorage.getItem("cldc_" + type) || "[]");
  records.push(data);
  localStorage.setItem("cldc_" + type, JSON.stringify(records));
}

document.getElementById("formFormacao").addEventListener("submit", e => {
  e.preventDefault();
  saveRecord("formandos", e.target);
  showToast("Inscrição enviada com sucesso. Taxa de inscrição: 5.000 Kz.");
  e.target.reset();
});

document.getElementById("formConsultoria").addEventListener("submit", e => {
  e.preventDefault();
  saveRecord("consultorias", e.target);
  showToast("Pedido de consultoria enviado com sucesso.");
  e.target.reset();
});

document.getElementById("formCandidatura").addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  data.data = new Date().toLocaleString("pt-AO");
  const id = "CLDC-" + Date.now().toString().slice(-7);
  data.codigo = id;
  const records = JSON.parse(localStorage.getItem("cldc_candidaturas") || "[]");
  records.push(data);
  localStorage.setItem("cldc_candidaturas", JSON.stringify(records));
  showToast("Candidatura enviada. Código: " + id);
  e.target.reset();
});

document.getElementById("loginForm").addEventListener("submit", e => {
  e.preventDefault();
  const user = document.getElementById("adminUser").value.trim();
  const pass = document.getElementById("adminPass").value;
  if (user === "admin" && pass === "cldc123") {
    sessionStorage.setItem("cldc_admin", "true");
    updateAdmin();
    showToast("Login efetuado com sucesso.");
  } else {
    showToast("Utilizador ou palavra-passe incorretos.");
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("cldc_admin");
  updateAdmin();
  showToast("Sessão terminada.");
});

function count(type) {
  return JSON.parse(localStorage.getItem("cldc_" + type) || "[]").length;
}

function updateAdmin() {
  const logged = sessionStorage.getItem("cldc_admin") === "true";
  document.getElementById("loginBox").classList.toggle("hidden", logged);
  document.getElementById("adminPanel").classList.toggle("hidden", !logged);
  document.getElementById("statFormandos").textContent = count("formandos");
  document.getElementById("statConsultas").textContent = count("consultorias");
  document.getElementById("statCandidaturas").textContent = count("candidaturas");
}

document.querySelectorAll("[data-pdf]").forEach(button => {
  button.addEventListener("click", () => generatePDF(button.dataset.pdf));
});

function generatePDF(type) {
  if (!window.jspdf) {
    showToast("Biblioteca PDF não carregada. Verifique a ligação à internet.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const title = type === "certificado" ? "CERTIFICADO" :
                type === "factura" ? "FACTURA" : "FOLHA DE CANDIDATURA";
  const now = new Date().toLocaleDateString("pt-AO");
  doc.setFontSize(22);
  doc.text("CLDC", 105, 30, {align:"center"});
  doc.setFontSize(16);
  doc.text(title, 105, 48, {align:"center"});
  doc.setFontSize(11);
  doc.text("Consultoria Linguística, Demócrito - Comunicação, Línguas e Desenvolvimento", 105, 60, {align:"center"});
  doc.line(20, 68, 190, 68);
  doc.setFontSize(12);
  if (type === "certificado") {
    doc.text("Certificamos que __________________________________________", 20, 95);
    doc.text("concluiu com aproveitamento a formação:", 20, 108);
    doc.text("__________________________________________________________", 20, 122);
    doc.text("Data: " + now, 20, 155);
    doc.text("Assinatura e carimbo: _________________________________", 20, 180);
  } else if (type === "factura") {
    doc.text("Nº da factura: CLDC-" + Date.now().toString().slice(-6), 20, 92);
    doc.text("Cliente: ________________________________________________", 20, 108);
    doc.text("Serviço: ________________________________________________", 20, 122);
    doc.text("Valor: __________________________ Kz", 20, 136);
    doc.text("Data: " + now, 20, 150);
  } else {
    doc.text("Código da candidatura: _________________________________", 20, 92);
    doc.text("Nome: _________________________________________________", 20, 108);
    doc.text("BI: ____________________________________________________", 20, 122);
    doc.text("Vaga: _________________________________________________", 20, 136);
    doc.text("Estado: ________________________________________________", 20, 150);
    doc.text("Data: " + now, 20, 164);
  }
  doc.save("CLDC_" + type + ".pdf");
  showToast("PDF gerado com sucesso.");
}

document.getElementById("clearData").addEventListener("click", () => {
  if (confirm("Apagar os dados de demonstração deste navegador?")) {
    ["formandos", "consultorias", "candidaturas"].forEach(k => localStorage.removeItem("cldc_" + k));
    updateAdmin();
    showToast("Dados de demonstração apagados.");
  }
});

updateAdmin();
