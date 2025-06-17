const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const products = {
  A: { name: "Product A", price: 20 },
  B: { name: "Product B", price: 40 },
  C: { name: "Product C", price: 50 },
};

const cart = {
  A: { quantity: 0, giftWrap: false },
  B: { quantity: 0, giftWrap: false },
  C: { quantity: 0, giftWrap: false },
};

const askQuestions = async () => {
  for (let key of Object.keys(products)) {
    await new Promise((resolve) => {
      rl.question(`Enter quantity for ${products[key].name}: `, (qty) => {
        cart[key].quantity = parseInt(qty) || 0;
        rl.question(`Gift wrap for ${products[key].name}? (yes/no): `, (gift) => {
          cart[key].giftWrap = gift.toLowerCase() === "yes";
          resolve();
        });
      });
    });
  }

  rl.close();
  calculateTotal();
};

const calculateTotal = () => {
  let subtotal = 0;
  let totalQty = 0;
  let giftWrapFee = 0;
  const itemTotals = {};

  for (let key in cart) {
    const qty = cart[key].quantity;
    const total = qty * products[key].price;
    itemTotals[key] = total;
    subtotal += total;
    totalQty += qty;
    if (cart[key].giftWrap) giftWrapFee += qty;
  }

  // Discounts
  let discountName = "No Discount";
  let discountAmount = 0;
  const discounts = [];

  if (subtotal > 200) discounts.push({ name: "flat_10_discount", amount: 10 });

  for (let key in cart) {
    if (cart[key].quantity > 10) {
      discounts.push({
        name: "bulk_5_discount",
        amount: itemTotals[key] * 0.05,
      });
      break;
    }
  }

  if (totalQty > 20) {
    discounts.push({ name: "bulk_10_discount", amount: subtotal * 0.1 });
  }

  if (totalQty > 30) {
    for (let key in cart) {
      const qty = cart[key].quantity;
      if (qty > 15) {
        const discount = (qty - 15) * products[key].price * 0.5;
        discounts.push({ name: "tiered_50_discount", amount: discount });
        break;
      }
    }
  }

  if (discounts.length > 0) {
    const best = discounts.reduce((max, curr) =>
      curr.amount > max.amount ? curr : max
    );
    discountName = best.name;
    discountAmount = best.amount;
  }

  const shippingFee = Math.ceil(totalQty / 10) * 5;
  const total = subtotal - discountAmount + shippingFee + giftWrapFee;

  console.log("\n------ BILL SUMMARY ------\n");
  for (let key in cart) {
    const item = cart[key];
    console.log(
      `${products[key].name} - Quantity: ${item.quantity}, Total: $${itemTotals[key]}`
    );
  }

  console.log(`\nSubtotal: $${subtotal}`);
  console.log(`Discount Applied: ${discountName} - $${discountAmount}`);
  console.log(`Shipping Fee: $${shippingFee}`);
  console.log(`Gift Wrap Fee: $${giftWrapFee}`);
  console.log(`Total: $${total}`);
};

// Run
askQuestions();
