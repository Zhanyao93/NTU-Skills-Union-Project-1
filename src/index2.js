let contentGrid = document.querySelector("#content-box");
let pinButton = document.querySelector("#pin");
let pinMap; //global variable to deal with url storage


// generate new Pin when the "Pin" button is pressed
function pin(event) {
  event.preventDefault();
  let img = new Image();
  let url = document.querySelector("#url-input").value;
  img.onload = function() {
    if (!duplicate(url)) {
      let titleInput = prompt("Please label the image");
      if (titleInput == null || titleInput == "") {
        alert("Image requires a label");
      } else {
        let title = titleInput;
        img.className = "pin-img";
        let pinContainer = document.createElement("div");
        pinContainer.className = "pin-container";
        pinContainer.innerHTML = `<div class="pin-bar">
                                        <div class="pin-header">${title}</div>
                                        <div class="pin-cross" onclick="deletePin(this)">X</div>
                                    </div>
                                    <div class="pin-img-frame">
                                        ${img.outerHTML}
                                    </div>`;

        store(url, title);
        prependElem(contentGrid, pinContainer);
        document.querySelector("#url-input").value = "";
      }
    } 
  };

  img.onerror = function () {
    !url ? alert("Image URL cannot be empty") : alert(`Image URL(${url}) was unable to be loaded`);
  };
  //give img ability to be clicked
  img.setAttribute("onclick","imgPopup(this)");

  // set src after onload and onerror is set
  img.src = url;
};

// generate out pins based on the localStorage
function generate() {
    //loop through all the keys(URL) and run function createPin for each URL
    [...pinMap.keys()].forEach((elem) => createPin(elem));
}

function createPin(url) {
    //console.log(url); for testing
    let img = new Image();
    let title = pinMap.get(url).title;
    img.className = "pin-img";
    img.src = url;
    img.setAttribute("onclick","imgPopup(this)");
    let pinContainer = document.createElement("div");
    pinContainer.className = "pin-container";
    pinContainer.innerHTML = `<div class="pin-bar">
                                    <div class="pin-header">${title}</div>
                                    <div class="pin-cross" onclick="deletePin(this)">X</div>
                                </div>
                                <div class="pin-img-frame">
                                    ${img.outerHTML}
                                </div>`;
    prependElem(contentGrid, pinContainer);                         
}


// function to remove pin from content area
function deletePin(element) {
  let pinContainer = element.parentElement.parentElement;
  let title = pinContainer.querySelector(".pin-header").innerHTML;
  let url = pinContainer.querySelector(".pin-img").src;
  if (confirm(`Are you sure you want to remove "${title}"`) == true) {
    pinContainer.remove();
    pinMap.delete(url);
    localStorage.setItem("pinMap", JSON.stringify([...pinMap]));
  };
};

//popup when chicked on image
function imgPopup(element) {
    let layout = document.querySelector("#popup-layout");
    let title = layout.querySelector("#popup-title");
    let img = layout.querySelector("#popup-img");
    let url = layout.querySelector("#popup-url");
    layout.style.display = "flex";
    console.log(element.src);
    title.innerHTML = pinMap.get(element.src).title;
    img.src = element.src;
    url.value = element.src;
}

function closePopup(element) {
    let popupLayout = document.querySelector("#popup-layout");
    popupLayout.style.display = "none";
}

//function to check for dup
function duplicate(url) {
  // return true if url already exist and false if it is new
  if ([...pinMap.keys()].some((key) => key == url)) {
    alert(`Image with url(${url}) already exist`);
    return true;
  } 
  return false;
}

// storing into local storage
function store(url, title) {
    pinMap.set(url, {"title": title});
    localStorage.setItem("pinMap", JSON.stringify([...pinMap]));
};

// so that latest added image appears at the front
function prependElem(parent, child) {
    parent.insertBefore(child, parent.firstChild);
};

// load localStorage for pinMap
function loadMap() {
    if (localStorage.getItem("pinMap") === null) {
        pinMap = new Map();
    } else {
        pinMap = new Map(JSON.parse(localStorage.getItem("pinMap")));
    };
};

//copy input to clipboard
function copyLink() {
    let copyText = document.querySelector("#popup-url");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
}

// function for onload
function pageOnLoad() {
    loadMap();
    generate();
};

pinButton.addEventListener("click", pin);
window.addEventListener("load", pageOnLoad);
