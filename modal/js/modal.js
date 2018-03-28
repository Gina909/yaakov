var modal = document.querySelector(".modal");
console.log("modal is  " + modal);
var trigger = document.querySelector(".trigger");
console.log("trigger is  " + trigger);
var closeButton = document.querySelector(".close-button");
console.log("closebutton is  " +  closeButton);
function toggleModal() {
    modal.classList.toggle("show-modal");
}

function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}

trigger.addEventListener("click", toggleModal);
closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);
