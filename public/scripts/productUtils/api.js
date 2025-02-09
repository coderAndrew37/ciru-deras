import { baseUrl } from "../constants.js"; // ✅ FIX: Import baseUrl

export async function fetchProducts(filters = {}) {
  try {
    let url = new URL(`${baseUrl}/api/products`);
    Object.keys(filters).forEach((key) => {
      if (filters[key]) url.searchParams.append(key, filters[key]);
    });

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error(`❌ Error fetching products:`, error);
    return [];
  }
}

export async function fetchCustomerImages(category) {
  try {
    const response = await fetch("/data/customerImages.json");
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.json();
    return data[category] || [];
  } catch (error) {
    console.error(`❌ Error fetching customer images:`, error);
    return [];
  }
}
