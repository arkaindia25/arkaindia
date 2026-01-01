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

  alert("Order placed successfully!");
  localStorage.removeItem("cart");
  window.location.href = "index.html";
}
