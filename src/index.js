let contentGrid = document.querySelector("#content-box");
let pinButton = document.querySelector("#pin");

function pin(event) {
    event.preventDefault();
    let img = new Image();
    let url = document.querySelector("#url-input").value;
    img.onload = function() {
        let titleInput = prompt("Please label the image");
        if (titleInput == null || titleInput == "") {
            alert("Image requires a label");
        } else {
            let title = titleInput;
            img.className = "pin-img";
            let pinContainer = document.createElement("div");
            pinContainer.className = "pin-container";
            pinContainer.innerHTML= `<div class="pin-bar">
                                        <div class="pin-header">${title}</div>
                                        <div class="pin-cross" onclick="deletePin(this)">X</div>
                                    </div>
                                    <div class="pin-img-frame">
                                        ${img.outerHTML}
                                    </div>`;
            contentGrid.appendChild(pinContainer);
        }
    };
    img.onerror = function() {
        !url? alert("Image URL cannot be empty")
            : alert(`Image URL(${url}) was unable to be loaded`);
    };
    img.src = url;
};

function deletePin(element) {
    let pinContainer = element.parentElement.parentElement;
    let title = pinContainer.querySelector(".pin-header").innerHTML;
    if (confirm(`Are you sure you want to remove "${title}"`) == true) {
        pinContainer.remove();
    };
};

pinButton.addEventListener("click", pin);

