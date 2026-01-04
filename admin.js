
document.getElementById("invoice").style.display = "block";
const ADMIN_PIN = "1234";   // Change this to your secret

function login() {
  let pass = document.getElementById("adminPass").value;

  if (pass === ADMIN_PIN) {
    localStorage.setItem("arkaAdmin", "logged");
    showAdmin();
  } else {
    alert("Wrong PIN");
  }
}

function showAdmin() {
  if (localStorage.getItem("arkaAdmin") === "logged") {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
  } else {
    document.getElementById("adminPanel").style.display = "none";
  }
}

showAdmin();
let orders = JSON.parse(localStorage.getItem("arkaOrders")) || [];

function renderOrders(list = orders) {
  let html = "";
  function updateDashboard() {
  drawSalesChart();
  renderSalesChart();
  let totalOrders = orders.length;
  let totalSales = 0;
  let inDelivery = 0;
  let delivered = 0;
  let monthlySales = 0;
  let todaySales = 0;
  let yesterdaySales = 0;

  let now = new Date();
  let thisMonth = now.getMonth();
  let thisYear = now.getFullYear();

  let today = new Date();
  let yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  orders.forEach(o => {
    totalSales += o.total;

    // Convert DD/MM/YYYY safely
    let parts = o.date.split("/");
    let d = new Date(parts[2], parts[1] - 1, parts[0]);

    // Monthly revenue
    if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
      monthlySales += o.total;
    }

    // Today sales
    if (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    ) {
      todaySales += o.total;
    }

    // Yesterday sales
    if (
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()
    ) {
      yesterdaySales += o.total;
    }

    if (o.status === "Delivered") delivered++;
    if (o.status === "Dispatched" || o.status === "Out for Delivery") inDelivery++;
  });

  document.getElementById("totalOrders").innerText = totalOrders;
  document.getElementById("totalSales").innerText = "₹" + totalSales;
  document.getElementById("inDelivery").innerText = inDelivery;
  document.getElementById("delivered").innerText = delivered;
  document.getElementById("monthlySales").innerText = "₹" + monthlySales;
  document.getElementById("todaySales").innerText = "₹" + todaySales;
  document.getElementById("yesterdaySales").innerText = "₹" + yesterdaySales;
}
  list.forEach((o, index) => {
    html += `
      <div class="order-box">
        <b>Order ID:</b> ${o.orderId}<br>
        <button onclick="downloadInvoice('${o.orderId}')">🧾 Invoice</button>
        <b>Customer:</b> ${o.customer.name}<br>
        <b>Total:</b> ₹${o.total}<br>
        <b>Status:</b> ${o.status}<br>

        <select onchange="updateStatus('${o.orderId}', this.value)">
          <option ${o.status=="Ordered"?"selected":""}>Ordered</option>
          <option ${o.status=="Dispatched"?"selected":""}>Dispatched</option>
          <option ${o.status=="Out for Delivery"?"selected":""}>Out for Delivery</option>
          <option ${o.status=="Delivered"?"selected":""}>Delivered</option>
          <button onclick="deleteOrder('${o.orderId}')" style="
  background:#e74c3c;
  color:white;
  border:none;
  padding:8px 12px;
  margin-left:10px;
  cursor:pointer;">
  🗑 Delete
</button>
        </select>
        <button onclick="deleteOrder('${o.orderId}')">🗑 Delete</button>
      </div>
    `;
  });

  document.getElementById("orders").innerHTML = html;
}

function updateStatus(orderId, newStatus) {
  orders = orders.map(o => {
    if (o.orderId === orderId) {
      o.status = newStatus;
    }
    return o;
  });

  localStorage.setItem("arkaOrders", JSON.stringify(orders));
  renderOrders();
}

function searchOrder() {
  let val = document.getElementById("searchOrder").value.trim().toLowerCase();

  if (!val) {
    renderOrders();
    return;
  }

  let filtered = orders.filter(o => o.orderId.toLowerCase().includes(val));
  renderOrders(filtered);
}

renderOrders();
function filterStatus() {
  let status = document.getElementById("statusFilter").value;

  if (!status) {
    renderOrders();
    return;
  }

  let filtered = orders.filter(o => o.status === status);
  renderOrders(filtered);
}
function deleteOrder(orderId) {
  if (!confirm("Delete this order?")) return;

  orders = orders.filter(o => o.orderId !== orderId);
  localStorage.setItem("arkaOrders", JSON.stringify(orders));
  renderOrders();
}
function exportCSV() {
  let csv = "OrderID,Customer,Mobile,City,Total,Status,Date\n";

  orders.forEach(o => {
    csv += `${o.orderId},${o.customer.name},${o.customer.mobile},${o.customer.city},${o.total},${o.status},${o.date}\n`;
  });

  let blob = new Blob([csv], { type: "text/csv" });
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "arka_orders.csv";
  a.click();
}
function drawSalesChart() {
  let canvas = document.getElementById("salesChart");
  let ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let salesByDate = {};

  orders.forEach(o => {
    let date = o.date;
    salesByDate[date] = (salesByDate[date] || 0) + o.total;
  });

  let dates = Object.keys(salesByDate);
  let values = Object.values(salesByDate);

  if (dates.length === 0) return;

  let max = Math.max(...values);
  let barWidth = canvas.width / (dates.length * 2);

  dates.forEach((d, i) => {
    let height = (values[i] / max) * 200;
    let x = i * barWidth * 2 + 50;
    let y = 250 - height;

    // Bar
    ctx.fillStyle = "#3498db";
    ctx.fillRect(x, y, barWidth, height);

    // Amount
    ctx.fillStyle = "#000";
    ctx.fillText("₹" + values[i], x, y - 5);

    // Date
    ctx.fillText(d, x, 270);
  });
}

function renderSalesChart() {
  let salesByDay = {};

  // prepare last 7 days
  for (let i = 6; i >= 0; i--) {
    let d = new Date();
    d.setDate(d.getDate() - i);
    let key = d.toLocaleDateString();
    salesByDay[key] = 0;
  }

  orders.forEach(o => {
    let parts = o.date.split("/");
    let d = new Date(parts[2], parts[1] - 1, parts[0]);
    let key = d.toLocaleDateString();
    if (salesByDay[key] !== undefined) {
      salesByDay[key] += o.total;
    }
  });

  let labels = Object.keys(salesByDay);
  let data = Object.values(salesByDay);

  let ctx = document.getElementById("salesChart").getContext("2d");

  if (window.salesChart) window.salesChart.destroy();

  window.salesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Daily Sales (₹)",
        data: data,
        backgroundColor: "#0abfbc"
      }]
    }
  });
}
function downloadInvoice(orderId) {
  let orders = JSON.parse(localStorage.getItem("arkaOrders")) || [];
  let order = orders.find(o => o.orderId === orderId);
  if (!order) return alert("Order not found");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const logo = new Image();
  logo.src = "Arka Logo.png";

  logo.onload = function () {
    // HEADER BAR
    doc.setFillColor(30, 160, 150);
    doc.rect(0, 0, 210, 35, "F");

    // LOGO
    doc.addImage(logo, "PNG", 10, 7, 22, 20);

    // BRAND
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("Arka India", 40, 20);
    doc.setFontSize(11);
    doc.text("Premium Products", 40, 28);

    doc.setTextColor(0, 0, 0);

    // INVOICE INFO
    doc.setFontSize(11);
    doc.text("Invoice", 160, 50);
    doc.text("Order ID: " + order.orderId, 15, 55);
    doc.text("Customer: " + (order.name || "N/A"), 15, 65);
    doc.text("Date: " + order.date, 15, 75);
    doc.text("Status: " + order.status, 15, 85);

    // TABLE HEADER
    let y = 105;
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Item", 15, y);
    doc.text("Qty", 120, y);
    doc.text("Amount", 160, y);
    doc.line(15, y + 3, 195, y + 3);

    doc.setFont(undefined, "normal");
    y += 15;

    // ITEMS
    order.items.forEach(i => {
      doc.text(i.name, 15, y);
      doc.text(String(i.qty), 125, y);
      doc.text("₹" + (i.qty * i.price), 160, y);
      y += 10;
    });

    // TOTAL LINE
    doc.line(15, y, 195, y);
    y += 10;
    doc.setFontSize(14);
    doc.text("Total", 120, y);
    doc.text("₹" + order.total, 160, y);

    // FOOTER BAR
    y += 25;
    doc.setFillColor(240, 240, 240);
    doc.rect(0, y, 210, 25, "F");

    doc.setFontSize(10);
    doc.text("Thank you for shopping with Arka India", 15, y + 10);
    doc.text("www.arkaindia.com | Support: +91 72920 60278", 15, y + 18);

    doc.save("Invoice_" + order.orderId + ".pdf");
  };
}
document.getElementById("invNo").innerText =
   "AI-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random()*9000);

document.getElementById("customer").innerText = order.customer || "N/A";
document.getElementById("city").innerText = order.city || "N/A";
document.getElementById("orderId").innerText = order.id;
document.getElementById("date").innerText = new Date().toLocaleString();
document.getElementById("status").innerText = order.status;

let rows = "";
order.items.forEach(it => {
  rows += `
    <tr>
      <td>${it.name}</td>
      <td>${it.qty}</td>
      <td>Rs. ${it.price}</td>
      <td>Rs. ${it.qty * it.price}</td>
    </tr>
  `;
});
document.getElementById("items").innerHTML = rows;
document.getElementById("grandTotal").innerText = "Rs. " + order.total;
document.getElementById("invoice").style.display = "none";
document.getElementById("invNo").innerText = "INV-" + order.id.slice(-6);

