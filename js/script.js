function openTab(event, tabName) {
  // Hide all tab content
  let tabContent = document.getElementsByClassName("tab-content");
  for (let i = 0; i < tabContent.length; i++) {
      tabContent[i].style.display = "none";
  }

  // Remove active class from all buttons
  let tabButtons = document.getElementsByClassName("tab-button");
  for (let i = 0; i < tabButtons.length; i++) {
      tabButtons[i].classList.remove("active");
  }

  // Show the selected tab and set active class
  document.getElementById(tabName).style.display = "block";
  event.currentTarget.classList.add("active");
}

// Set default tab on page load
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("education").style.display = "block";
});
