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
let studentsArr = [];
let fixedStudentsArr = [];
let expelledStudentsArr = [];

const Student = {
  fullName: "-full name-",
  firstName: "-first name-",
  lastName: "-last name-",
  house: "-house-",
  image: "-image-",
  id: "-id-"
}

function pageDidLoad() {
  getJSON().then(() => init());
}

function init() {
  prepObject(jsonData);
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

// Get JSON, put it to jsonData and call prepObject
function getJSON() {
  return fetch("http://petlatkea.dk/2019/hogwarts/students.json")
  .then(res => res.json())
  .then(data => jsonData = data);
}

// Prep the data
function prepObject(jsonData) {
  jsonData.forEach((jsonObj, key) => {
    const student = Object.create(Student);
    let nameSplitArr = jsonObj.fullname.split(" ");
    
    student.id = key;
    student.fullName = jsonObj.fullname;
    student.firstName = nameSplitArr[0];
    student.lastName = nameSplitArr[nameSplitArr.length - 1];
    student.house = jsonObj.house;
    // TODO: might have an error for -unknown- surename
    student.image = `${student.lastName.toLowerCase()}_${student.firstName.charAt(0).toLowerCase()}.png`;
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
  console.log("displayList------", list);
  section.innerHTML = "";
  list.forEach((student, key)=> {
    const tplClone = tpl.cloneNode(true);
    let studentFullName = student.fullName;
    tplClone.getElementById('name').innerHTML = student.firstName;
    tplClone.getElementById('house').innerHTML = student.house;
    tplClone.querySelector("#img-house").src = getImg(student.house);
    tplClone.querySelector("#img-student").src = `images/${student.image}`;
    // tplClone.querySelector(".card").classList.add(`student${key}`);
    tplClone.querySelector("button").style.zIndex = "2";
    tplClone.querySelector("button").onclick = (e) => {
      e.stopPropagation();
      // TODO: call function to expel
      expelStudent(student);
    }
    tplClone.querySelector(`.card`).onclick = () => { displayModal(student) };
    
    if (student.lastName != "-unknown-") {
      tplClone.querySelector("#lastName").innerHTML = student.lastName;
    } else {
      tplClone.querySelector("#lastName").innerHTML = "???";
    }
    section.appendChild(tplClone);
})
}

// Display modal with information of a single student
function displayModal(student) {
  modal.style.display = "initial";
  modal.addEventListener("click", () => {modal.style.display = "none";});
  modal.querySelector("h1").innerHTML = student.fullName;
  modal.querySelector("h2").innerHTML = student.house;
  modal.querySelector("img").src = `images/${student.image}`;
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
  let superUniqueId = JSON.stringify(student);
  expelledStudentsArr.push(student);
  fixedStudentsArr = fixedStudentsArr.filter(elem => elem.id !== student.id);
  studentsArr = studentsArr.filter(elem => elem.id !== student.id);
  displayList(fixedStudentsArr);
  updateStatistics();
}

// Update stats
function updateStatistics() {
  totalNr.innerHTML = studentsArr.length;
  totalHuffNr.innerHTML = studentsArr.filter(student => student.house === 'Hufflepuff').length
  totalGryfNr.innerHTML = studentsArr.filter(student => student.house === 'Gryffindor').length
  totalRaveNr.innerHTML = studentsArr.filter(student => student.house === 'Ravenclaw').length
  totalSlytNr.innerHTML = studentsArr.filter(student => student.house === 'Slytherin').length
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