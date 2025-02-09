document.addEventListener("DOMContentLoaded", () => {
  const breadcrumbContainer = document.getElementById("breadcrumb");
  if (!breadcrumbContainer) return;

  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  let breadcrumbHTML = `
    <li>
      <a href="/" class="text-primary hover:underline flex items-center">
        <i class="fas fa-home mr-1"></i> Home
      </a>
    </li>
  `;

  let pathAccumulator = "";

  pathSegments.forEach((segment, index) => {
    pathAccumulator += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    const label = segment.replace(/[-_]/g, " ").toUpperCase();

    let icon = "";
    if (segment.includes("cart"))
      icon = '<i class="fas fa-shopping-cart mr-1"></i>';
    if (segment.includes("checkout"))
      icon = '<i class="fas fa-credit-card mr-1"></i>';

    breadcrumbHTML += isLast
      ? `<li class="text-gray-500 flex items-center">${icon}${label}</li>`
      : `<li>
          <a href="${pathAccumulator}" class="text-primary hover:underline flex items-center">
            ${icon}${label}
          </a>
        </li>`;
  });

  breadcrumbContainer.innerHTML = breadcrumbHTML.replace(
    /<\/li>/g,
    ' <span class="mx-1 text-gray-400">›</span> </li>'
  );
});
