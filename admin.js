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

  list.forEach((o, index) => {
    html += `
      <div class="order-box">
        <b>Order ID:</b> ${o.orderId}<br>
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
  let csv = "Order ID,Customer,Mobile,City,Total,Status,Date\n";

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
