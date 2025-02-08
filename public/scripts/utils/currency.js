export function formatCurrency(cents) {
  return (cents / 100).toLocaleString("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  });
}
