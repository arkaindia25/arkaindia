// Read order id from URL
const params = new URLSearchParams(window.location.search);
const orderId = params.get("order");

// Load all orders
let orders = JSON.parse(localStorage.getItem("arkaOrders")) || [];

// Find this order
let order = orders.find(o => o.orderId === orderId);

if (!order) {
  document.getElementById("trackBox").innerHTML = "<h3 style='color:red'>❌ Order not found</h3>";
} else {

  // Fill basic details
  document.getElementById("orderId").innerText = order.orderId;
  document.getElementById("custName").innerText = order.customer.name;
  document.getElementById("amount").innerText = "₹" + order.total;

  // Show items
  let itemsHtml = "";
  order.items.forEach(i => {
    itemsHtml += `<div>${i.name} × ${i.qty} = ₹${i.price * i.qty}</div>`;
  });
  document.getElementById("orderItems").innerHTML = itemsHtml;

  // Status progress
  const steps = ["Ordered", "Dispatched", "Out for Delivery", "Delivered"];
  steps.forEach(step => {
    if (steps.indexOf(step) <= steps.indexOf(order.status)) {
      document.getElementById(step).classList.add("done");
    }
  });

  // WhatsApp invoice
  document.getElementById("sendInvoiceBtn").onclick = function () {

    let invoice = `🧾 *ARKA INDIA*
Order ID: ${order.orderId}

Customer: ${order.customer.name}
Mobile: ${order.customer.mobile}
City: ${order.customer.city}

----------------
Items:
`;

    order.items.forEach(i => {
      invoice += `• ${i.name} x${i.qty} = ₹${i.price * i.qty}\n`;
    });

    invoice += `
----------------
Total: ₹${order.total}
Status: ${order.status}

Thank you for shopping with Arka India 🙏`;

    let mobile = order.customer.mobile.replace(/\D/g, "");
    let url = "https://wa.me/917292060278" + mobile + "?text=" + encodeURIComponent(invoice);
    window.open(url, "_blank");
  };
}
