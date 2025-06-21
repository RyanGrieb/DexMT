export function onProfileLoaded() {
  const backButton = document.getElementById("backToUsers ");
  console.log(backButton);
  if (backButton) {
    backButton.addEventListener("click", () => {
      // Handle back button click
      console.log("Back to users clicked");
    });
  }
}
