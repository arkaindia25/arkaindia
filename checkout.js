const cart = JSON.parse(localStorage.getItem("cart")) || [];

const checkoutItems = document.getElementById("checkoutItems");
const checkoutTotal = document.getElementById("checkoutTotal");

let total = 0;

cart.forEach(item => {
  const row = document.createElement("div");
  row.className = "row";

  const itemTotal = item.price * item.qty;
  total += itemTotal;

  row.innerHTML = `
    <div>${item.name} (x${item.qty})</div>
    <div>₹${itemTotal}</div>
  `;

  checkoutItems.appendChild(row);
});

checkoutTotal.innerText = total;

function placeOrder(){
  if(cart.length === 0){
    alert("Your cart is empty");
    return;
  }
// Generate Order ID
let orderId = "ARKA" + Date.now();

// Get existing orders or empty array
let orders = JSON.parse(localStorage.getItem("arkaOrders")) || [];

// Create order object
let order = {
    orderId: orderId,
    date: new Date().toLocaleString(),
    status: "Ordered",
    items: JSON.parse(localStorage.getItem("cart")) || []
};

// Save order
orders.push(order);
localStorage.setItem("arkaOrders", JSON.stringify(orders));

// Clear cart
localStorage.removeItem("cart");


// Clear cart after order
localStorage.removeItem("cart");
localStorage.removeItem("grandTotal");

// Redirect to tracking page
window.location.href = "track.html?order=" + orderId;


  alert("Order placed successfully!");
  localStorage.removeItem("cart");
  window.location.href = "index.html";
}
