let contentGrid = document.querySelector("#content-box");
let pinButton = document.querySelector("#pin");
let collectionTitle = document.querySelector("#content-box-bar-title");
let pinMap; //global variable to deal with url storage
let curCollection = localStorage.getItem("currentCollection");

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
  contentGrid.innerHTML="";
  //loop through all the keys(URL) and run function createPin for each URL
  [...pinMap.keys()].forEach((elem) => createPin(elem));
};
// function to create pin based on url passed in (used in generate and search filter function)
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
};

// function to remove pin from content area
function deletePin(element) {
  let pinContainer = element.parentElement.parentElement;
  let title = pinContainer.querySelector(".pin-header").innerHTML;
  let url = pinContainer.querySelector(".pin-img").src;
  if (confirm(`Are you sure you want to remove "${title}"`) == true) {
    pinContainer.remove();
    pinMap.delete(url);
    localStorage.setItem(curCollection, JSON.stringify([...pinMap]));
  };
};

//popup when chicked on image
function imgPopup(element) {
    let layout = document.querySelector("#popup-layout");
    let title = layout.querySelector("#popup-title");
    let img = layout.querySelector("#popup-img");
    let url = layout.querySelector("#popup-url");
    layout.style.visibility = "flex";
    //console.log(element.src);
    title.innerHTML = pinMap.get(element.src).title;
    img.src = element.src;
    url.value = element.src;
    layout.style.animationName ="panel-popup";
};

function closePopup() {
    let popupLayout = document.querySelector("#popup-layout");
    popupLayout.style.animationName ="none";
    popupLayout.style.visibility = "hidden";
};

//function to check for dup
function duplicate(url) {
  // return true if url already exist and false if it is new
  if ([...pinMap.keys()].some((key) => key == url)) {
    alert(`Image with url(${url}) already exist`);
    return true;
  } 
  return false;
};

// storing into local storage
function store(url, title) {
    pinMap.set(url, {"title": title});
    localStorage.setItem(curCollection, JSON.stringify([...pinMap]));
};

// so that latest added image appears at the front
function prependElem(parent, child) {
    parent.insertBefore(child, parent.firstChild);
};

// load localStorage for pinMap
function loadMap() {
  if (localStorage.getItem(curCollection) === null) {
    pinMap = new Map();
    let collectionList = JSON.parse(localStorage.getItem("collectionList"));
    collectionList.push(curCollection);
    localStorage.setItem(curCollection, JSON.stringify([...pinMap]));
    localStorage.setItem("collectionList", JSON.stringify(collectionList));
  } else {
    pinMap = new Map(JSON.parse(localStorage.getItem(curCollection)));
  };
};

// load the last collection
function loadCollection() {
  if (localStorage.getItem("currentCollection") === null) {
    curCollection = "Default Collection";
    localStorage.setItem("currentCollection", curCollection);
    localStorage.setItem("collectionList", JSON.stringify([]));
  } 
  collectionTitle.innerHTML = curCollection + `<i id="drop-button" onclick="toggleDrop()" class="material-icons">&#xe5c5;</i>`;
};

//copy input to clipboard
function copyLink() {
    let copyText = document.querySelector("#popup-url");
    let popup = document.querySelector(".popup-copy-text");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    popup.style.animationName="popup-ani";
    popup.addEventListener('animationend', () => popup.style.animationName="none");
};

// function for onload
function pageOnLoad() {
  loadCollection();
  loadMap();
  generate();
  updateDrop();
};

//expand search bar (maybe can toggle instead)
function expandSearch() {
  let bar = document.querySelector("#content-search");
  let searchBtn = document.querySelector("#content-search-btn");
  bar.style.animationName = "expand-search";
  bar.focus()
  searchBtn.style.borderRadius = "0px 5px 5px 0px";
};
//shrink searchbar (maybe can toggle instead)
function shrinkSearch() {
  let bar = document.querySelector("#content-search");
  let searchBtn = document.querySelector("#content-search-btn");
  bar.style.animationName = "shrink-search";
  searchBtn.style.borderRadius = "5px";
};

// break input text by "space" and check each word for matching title and return all
// have to change if we want sort results to be inthe order they have been added to the collection
function search(event, filterKey) {
  if (event.key === 'Enter' || event.keyCode === 13) {
    let searchString = document.querySelector("#content-search").value;
    //break the string by space and remove empty element
    let searchWordArr = searchString.split(" ").filter(elem => elem);
    let filteredUrlArr = 
    searchWordArr.reduce((accumArr, curWord)=> {
      let urlArr = filter(curWord, filterKey);
      urlArr.forEach(url => {
        if (accumArr.indexOf(url) === -1) {
          accumArr.push(url);
        }
      })
      return accumArr
    }, []);
    if (filteredUrlArr.length != 0) {
      contentGrid.innerHTML="";
      filteredUrlArr.forEach((elem) => createPin(elem));
    } else {
      generate();
    }
  }
};

function filter(searchWord, filterKey) {
  let regex = new RegExp(searchWord, "i");
  let filteredKeys = [...pinMap.entries()]
  .filter(array => regex.test(array[1][filterKey]))//returns array of arrays[[url, {title: "A"}], [url, {title: "B"}]]
  .map((array => array[0]));
  //console.log(regex);
  //console.log(filteredKeys);
  return filteredKeys;
};

function toggleDrop() {
  document.querySelector(".dropdown-content").classList.toggle('active');
}

function updateDrop() {
  let list = JSON.parse(localStorage.getItem("collectionList"));
  document.querySelector(".dropdown-content").innerHTML = `<div class="dropdown-item" onclick="createCollection()">Create New</div>`;
  list.forEach(collectionName => {
    let item = document.createElement("div");
    item.className = "dropdown-item";
    item.innerHTML= collectionName;
    item.setAttribute("onclick","collectionClick(this)");
    document.querySelector(".dropdown-content").appendChild(item);
  })
};

function changeCollection(newCollection) {
  curCollection = newCollection;
  localStorage.setItem("currentCollection", curCollection)
  loadCollection();
  loadMap();
  generate();
};

function collectionClick(element) {
  changeCollection(element.innerHTML);
  toggleDrop();
};

function createCollection() {
  let collectionName = prompt("Please label the image");
  if (collectionName == null || collectionName == "") {
    alert("Collection name cannot be empty");
  } else if (JSON.parse(localStorage.collectionList).some((existName) => existName == collectionName)) {
    alert(`Collection("${collectionName}") already exist`);
  } else {
    changeCollection(collectionName);
    updateDrop();
    toggleDrop();
  }
};

function deleteCollection() {
  if (confirm(`Delete collection("${curCollection}")?`) == true) {
    localStorage.removeItem(curCollection);
    let list = JSON.parse(localStorage.collectionList).filter(collection => collection != curCollection);
    localStorage.setItem("collectionList", JSON.stringify(list));
    if (JSON.parse(localStorage.collectionList).length != 0) {
      newCollection = JSON.parse(localStorage.collectionList)[0];
      changeCollection(newCollection);
      updateDrop();
    }
    loadCollection();
    loadMap();
    generate();
  }
};

pinButton.addEventListener("click", pin);
window.addEventListener("load", pageOnLoad);
