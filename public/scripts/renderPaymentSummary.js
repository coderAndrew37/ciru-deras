import { formatCurrency } from "./utils/currency.js";

const TAX_RATE = 0.1;

function calculateProductTotal(cart = [], products = []) {
  return cart.reduce((total, cartItem) => {
    const matchingProduct = products.find(
      (product) => product._id === cartItem.productId
    );
    if (matchingProduct) {
      return total + matchingProduct.priceCents * cartItem.quantity;
    } else {
      console.warn(
        `Product not found for cart item with ID ${cartItem.productId}`
      );
      return total;
    }
  }, 0);
}

function calculateShippingTotal(cart = [], deliveryOptions = []) {
  return cart.reduce((total, cartItem) => {
    const selectedDeliveryInput = document.querySelector(
      `input[name="delivery-option-${cartItem.productId}"]:checked`
    );
    const selectedDeliveryOption = deliveryOptions.find(
      (option) => option.id === (selectedDeliveryInput?.value || "1")
    );
    if (selectedDeliveryOption) {
      return total + selectedDeliveryOption.priceCents;
    } else {
      console.warn(
        `Delivery option not found for cart item with ID ${cartItem.productId}`
      );
      return total;
    }
  }, 0);
}

function calculateEstimatedTax(totalBeforeTaxCents) {
  return totalBeforeTaxCents * TAX_RATE;
}

export function renderPaymentSummary(
  cart = [],
  products = [],
  deliveryOptions = []
) {
  const productTotalCents = calculateProductTotal(cart, products);
  const shippingTotalCents = calculateShippingTotal(cart, deliveryOptions);
  const totalBeforeTaxCents = productTotalCents + shippingTotalCents;
  const estimatedTaxCents = calculateEstimatedTax(totalBeforeTaxCents);
  const totalCents = totalBeforeTaxCents + estimatedTaxCents;

  const paymentSummaryHTML = `
  <div class="font-bold text-lg mb-4">Order Summary</div>
  <div class="flex justify-between text-base mb-2">
    <span>Items (${cart.length}):</span>
    <span>KSH ${formatCurrency(productTotalCents)}</span>
  </div>
  <div class="flex justify-between text-base mb-2">
    <span>Shipping & Handling:</span>
    <span>KSH ${formatCurrency(shippingTotalCents)}</span>
  </div>
  <div class="flex justify-between text-base font-medium border-t pt-2">
    <span>Total before tax:</span>
    <span>KSH ${formatCurrency(totalBeforeTaxCents)}</span>
  </div>
  <div class="flex justify-between text-base">
    <span>Estimated tax (${TAX_RATE * 100}%):</span>
    <span>KSH ${formatCurrency(estimatedTaxCents)}</span>
  </div>
  <div class="flex justify-between text-lg font-bold text-red-600 border-t pt-4">
    <span>Order Total:</span>
    <span>KSH ${formatCurrency(totalCents)}</span>
  </div>
  <button
    class="place-order-button w-full bg-idcHighlight text-idcText font-semibold py-2 px-4 rounded-lg hover:bg-yellow-500 mt-4"
  >
    Place Your Order
  </button>
`;

  document.querySelector(".js-payment-summary").innerHTML = paymentSummaryHTML;

  // Return totalCents to use in the order submission
  return totalCents;
}
