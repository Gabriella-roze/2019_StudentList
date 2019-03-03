"use strict";

window.addEventListener("DOMContentLoaded", pageDidLoad);

const tpl = document.querySelector("template").content;
const section = document.querySelector("section");
const modal = document.querySelector("#modal");

const expelledNr = document.querySelector("#expelledNr");
const totalNr = document.querySelector("#totalNr");
const totalHuffNr = document.querySelector("#totalHuffNr");
const totalGryfNr = document.querySelector("#totalGryfNr");
const totalRaveNr = document.querySelector("#totalRaveNr");
const totalSlytNr = document.querySelector("#totalSlytNr");

const btnFilterHufflepuff = document.querySelector("#filterHufflepuff");
const btnFilterGryffindor = document.querySelector("#filterGryffindor");
const btnFilterRavenclaw = document.querySelector("#filterRavenclaw");
const btnFilterSlytherin = document.querySelector("#filterSlytherin");
const btnFilterAll = document.querySelector("#all");

const btnSortFirst = document.querySelector("#sort-firstname");
const btnSortLast = document.querySelector("#sort-lastname");
const btnSortHouse = document.querySelector("#sort-house");

let jsonData;
let jsonBloodData;

let studentsArr = [];
let fixedStudentsArr = [
  {
    fullName: "Gintare Rozenaite",
    firstName: "Gintare",
    lastName: "Rozenaite",
    house: "Gryffindor",
    image: "li_s.png",
    bloodStatus: "pure",
    id: "35",
    inSquad: "false",
    canJoinSquad: "true"
  }
];
let expelledStudentsArr = [];

const Student = {
  fullName: "-full name-",
  firstName: "-first name-",
  lastName: "-last name-",
  house: "-house-",
  image: "-image-",
  bloodStatus: "-blood status",
  id: "-id-",
  inSquad: "-in squad-",
  canJoinSquad: "-can join squad-"
}

async function pageDidLoad() {
  jsonData = await getJSON();
  jsonBloodData = await getBloodJSON();
  init();
}

function init() {
  prepObject();
  fixedStudentsArr = sortBy(fixedStudentsArr, "firstName", "desc");
  addEventListeners();
  displayList(fixedStudentsArr);
  updateStatistics();
}

function addEventListeners() {
  // Filter
  btnFilterHufflepuff.addEventListener("click", () => {
    fixedStudentsArr = filterBy(studentsArr, "house", "Hufflepuff")
    displayList(fixedStudentsArr);
  });
  btnFilterGryffindor.addEventListener("click", () => {
    fixedStudentsArr = filterBy(studentsArr, "house", "Gryffindor")
    displayList(fixedStudentsArr);
  });
  btnFilterRavenclaw.addEventListener("click", () => {
    fixedStudentsArr = filterBy(studentsArr, "house", "Ravenclaw");
    displayList(fixedStudentsArr);
  });
  btnFilterSlytherin.addEventListener("click", () => {
    fixedStudentsArr = filterBy(studentsArr, "house", "Slytherin")
    displayList(fixedStudentsArr);
  });
  btnFilterAll.addEventListener("click", () => {
    fixedStudentsArr = studentsArr;
    displayList(fixedStudentsArr)
  });

  // Sort
  btnSortFirst.addEventListener("click", () => {
    displayList(sortBy(fixedStudentsArr, "firstName", "desc"));
  });
  btnSortLast.addEventListener("click", () => {
    displayList(sortBy(fixedStudentsArr, "lastName", "desc"));
  });
  btnSortHouse.addEventListener("click", () => {
    displayList(sortBy(fixedStudentsArr, "house", "desc"));
  });
}

// Get JSON of students
function getJSON() {
  return fetch("https://petlatkea.dk/2019/hogwarts/students.json")
  .then(res => res.json())
  .then(data => data);
}

// Get JSON of blood lines
function getBloodJSON() {
  return fetch("https://petlatkea.dk/2019/hogwarts/families.json")
    .then(res => res.json())
    .then(data => data);
}

// Prep the data
function prepObject() {
  jsonData.forEach((jsonObj, key) => {
    const student = Object.create(Student);
    let nameSplitArr = jsonObj.fullname.split(" ");
    
    student.id = key;
    student.inSquad = "false";
    student.fullName = jsonObj.fullname;
    student.firstName = nameSplitArr[0];
    student.lastName = nameSplitArr[nameSplitArr.length - 1];
    student.house = jsonObj.house;
    student.image = `${student.lastName.toLowerCase()}_${student.firstName.charAt(0).toLowerCase()}.png`;

    if (jsonBloodData.pure.includes(student.lastName) && !jsonBloodData.half.includes(student.lastName)) {
      let randomNum = Math.random();
      randomNum > 0.5 ? student.bloodStatus = "half" : student.bloodStatus = "muggle";
    } else if (jsonBloodData.half.includes(student.lastName)) {
      student.bloodStatus = "pure";
    } else {
      student.bloodStatus = "pure";
    }

    student.canJoinSquad = ( student.bloodStatus === "pure" || student.house === "Slytherin" ) ? "true" : "false" ;

 
    fixedStudentsArr.push(student);
  })
  studentsArr = fixedStudentsArr;
}

// Filter the student list
function filterBy(arr, property, value) {
  return arr.filter(elem => elem[property] === value);
}

// Display all students
function displayList(list) {
  section.innerHTML = "";
  list.forEach((student)=> {
    const tplClone = tpl.cloneNode(true);

    tplClone.getElementById('name').innerHTML = student.firstName;
    tplClone.getElementById('house').innerHTML = student.house;
    tplClone.querySelector("#img-house").src = getImg(student.house);
    tplClone.querySelector("#lastName").innerHTML = student.lastName;
    tplClone.querySelector("button").style.zIndex = "2";
    tplClone.querySelector(`.card`).onclick = () => { displayModal(student) };
    tplClone.querySelector("button").onclick = (e) => {
      e.stopPropagation();
      expelStudent(student);
    }

    if (student.lastName === "-unknown-") {
      tplClone.querySelector("#img-student").src = `images/unknown.png`;
    } else if (student.lastName === "Finch-Fletchley") {
      tplClone.querySelector("#img-student").src = `images/fletchley_j.png`;
    } else if (student.fullName === "Padma Patil") {
      tplClone.querySelector("#img-student").src = `images/patil_padme.png`;
    } else if (student.fullName === "Padma Patil") {
      tplClone.querySelector("#img-student").src = `images/patil_padme.png`;
    } else {
    tplClone.querySelector("#img-student").src = `images/${student.image}`;
    }
    
    section.appendChild(tplClone);
})
}

// Display modal with information of a single student
function displayModal(student) {
  modal.style.display = "initial";
  let buttonText = "";
  student.inSquad === "true" ? buttonText = "Remove from Inquisitorial Squad" : buttonText = "Add to Inquisitorial Squad";
  modal.querySelector("button").innerHTML = buttonText;
  modal.addEventListener("click", () => {
    modal.style.display = "none";
    modal.querySelector("p").classList.remove("anim-wanish");
  });
  modal.querySelector("h1").innerHTML = student.fullName;
  modal.querySelector("h2").innerHTML = student.house;
  modal.querySelector("img").src = `images/${student.image}`;
  modal.querySelector("h3").innerHTML = student.bloodStatus;
  modal.querySelector("button").style.zIndex = "3";
  modal.querySelector("button").onclick = (e) => {
    e.stopPropagation();
    addToSquad(student);
  }
  setTimeout(() => {
    modal.querySelector("p").classList.add("anim-wanish");
  }, randomIntBetween(200, 3000));
  modal.querySelector(".container").style.backgroundImage = `url(${getImg(student.house)})`;
  modal.querySelector("#squad_status").innerHTML = student.inSquad === "true" ? "Is an Inquisitorial Squad member!" : "Is NOT an Inquisitorial Squad member!"
}

// Get random time
function randomIntBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Add to Inquisitorial Squad
function addToSquad(student) {
  modal.querySelector("#squad_status").innerHTML = student.inSquad === "true" ? "Is an Inquisitorial Squad member!" : "Is NOT an Inquisitorial Squad member!"

  if (student.inSquad === "true") {
    student.inSquad = "false";
    modal.querySelector("button").innerHTML = "Add to Inquisitorial Squad";
  } else {
    if (student.canJoinSquad === "true") {
      student.inSquad = "true";
      modal.querySelector("button").innerHTML = "Remove from Inquisitorial Squad";
    } else {
      alert("This student is not a good fit!");
     
    }
  }
  modal.querySelector("#squad_status").innerHTML = student.inSquad === "true" ? "Is an Inquisitorial Squad member!" : "Is NOT an Inquisitorial Squad member!"
}

// Get image of the house (if get's broken, check links)
function getImg(house) {
    if (house === "Hufflepuff") {
        return "https://vignette.wikia.nocookie.net/csydes-test/images/e/ee/Hufflepuff_Crest.png/revision/latest?cb=20171101063214";
    }
    else if (house === "Gryffindor") {
        return "https://pngimage.net/wp-content/uploads/2018/06/gryffindor-crest-png.png";
    }
    else if (house === "Ravenclaw") {
        return "https://vignette.wikia.nocookie.net/csydes-test/images/2/2b/Ravenclaw_Crest.png/revision/latest?cb=20171101063206";
    }
    else {
        return "https://vignette.wikia.nocookie.net/csydes-test/images/4/45/Slytherin_Crest.png/revision/latest?cb=20171101063219";
    }
}

// Expel student
function expelStudent(student) {
  if (student.id === "35") {
    alert("CAN NOT DO THAT");
  } else {
    expelledStudentsArr.push(student);
    fixedStudentsArr = fixedStudentsArr.filter(elem => elem.id !== student.id);
    studentsArr = studentsArr.filter(elem => elem.id !== student.id);
    displayList(fixedStudentsArr);
    updateStatistics();
  }
}

// Update stats
function updateStatistics() {
  totalNr.innerHTML = studentsArr.length;
  totalHuffNr.innerHTML = studentsArr.filter(student => student.house === 'Hufflepuff').length;
  totalGryfNr.innerHTML = studentsArr.filter(student => student.house === 'Gryffindor').length;
  totalRaveNr.innerHTML = studentsArr.filter(student => student.house === 'Ravenclaw').length;
  totalSlytNr.innerHTML = studentsArr.filter(student => student.house === 'Slytherin').length;
  expelledNr.innerHTML = expelledStudentsArr.length;
}

// Compare names function
function nameSort(a, b) {
  if (a.firstName < b.firstName) {
    return -1;
  } else {
    return 1;
  }
}

// Sort
function sortBy(array, property, mode) {
  if (!mode || mode === 'desc') {
    return array.sort(sortDesc);
  }
  else {
    return array.sort(sortAsc);
  }

  function sortDesc(a, b) {
    if (a[property] < b[property])
      return -1;
    if (a[property] > b[property])
      return 1;
    return 0;
  }

  function sortAsc(a, b) {
    if (a[property] < b[property])
      return 1;
    if (a[property] > b[property])
      return -1;
    return 0;
  }
}