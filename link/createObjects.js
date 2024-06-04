// function to create examDetails object
function getExamDetails() {

  let schoolName = document.getElementById('school-name').value.trim();
  let examName = document.getElementById('exam-name').value.trim();
  let subject = document.getElementById('subject').value.trim();
  let duration = parseInt(document.getElementById('exam-duration').value.trim());
  duration = (isNaN(duration))? 180 : duration;
  let grade = document.getElementById('grade').value;

  const examDetails = {
     schoolName: schoolName,
     examName: examName,
     subject: subject,
     duration: duration,
     grade: grade
  }

  return JSON.stringify(examDetails);

}
// function ends

// function to create questionPaperMap object
function getQuestionPaperMap() {

  // create object
  const obj = {};

  
  // fetch all input fields related to chapter-wise question prompt
  let inputs = document.querySelectorAll('.ch-prompt input[type="number"]');
  inputs.forEach((input) => {

     // extract relevant data from number input fields
    const ch = input.dataset.chapter;
    const type = input.dataset.type;
    let val = parseInt(input.value);
    val = (isNaN(val))? 0 : val;

    // store data in object
    if(!obj.hasOwnProperty(ch)) {
      obj[ch] = {};
    }
    if(!obj[ch].hasOwnProperty(type) && val !== 0) {
      obj[ch][type] = val;
    }
    
  });
  // forEach ends

  // extract relevant data from checkboxes
  let checkboxes = document.querySelectorAll('.ch-prompt input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {

    const ch = checkbox.dataset.chapter;
    const type = checkbox.dataset.type;
    let val = checkbox.checked;

    if(type === 'Match items') {
      val = (val)? 99999: 0;
    }

    if(!obj.hasOwnProperty(ch)) {
      obj[ch] = {};
    }

    if(!obj[ch].hasOwnProperty(type)) {
      obj[ch][type] = val;
    }
    
  });
  // forEach ends
  
  // return stringified object
  return JSON.stringify(obj);
}
// function ends

// function to create qContainers object
function getQContainers() {
  const qContainers = {};

  // add container headings
  qContainers['headings'] = [];
  const headings = document.querySelectorAll('.container-question-input');
  headings.forEach((heading) => {
      qContainers['headings'].push(heading.value.trim());
  });
  // forEach ends


  // add qTypes (no. of questions of different types for each container)
  qContainers['qTypes'] = [];
  const array = qContainers['qTypes'];
  const numInputs = document.querySelectorAll('.container-prompt .number-input');
  numInputs.forEach((input) => {
    const index = input.dataset.container;
    const type = input.dataset.type;
    let val = parseInt(input.value);
    val = (isNaN(val))? 0 : val;

    // create an empty object if not already there at this index in qContainers['qTypes']
    if (!array.hasOwnProperty(index) || typeof array[index] !== 'object' || array[index] === null) {
        array[index] = {};
    }
    
    // insert into qTypes
    if(val !== 0) {
      array[index][type] = val;
    }

  });
  // forEach ends

  // add weightPerQ (for all qTypes for each container)
  qContainers['weightPerQ'] = [];
  const array2 = qContainers['weightPerQ'];
  const wInputs = document.querySelectorAll('.container-prompt .weightage-input');
  wInputs.forEach((input) => {
    const index = input.dataset.container;
    const type = input.dataset.type;
    let val = parseFloat(input.value);
    val = (isNaN(val))? 0 : val;

    // create an empty object if not already there at this index in qContainers['qTypes']
    if (!array2.hasOwnProperty(index) || typeof array2[index] !== 'object' || array2[index] === null) {
        array2[index] = {};
    }
    
    // insert into qTypes
    if(val !== 0) {
      array2[index][type] = val;
    }

  });
  // forEach ends

  // add mustInclude
  qContainers['mustInclude'] = createMustIncludeArray();

  // add settings object
  qContainers['settings'] = createSettingsObj();

  return JSON.stringify(qContainers);

}
// function ends

// function to create settings object
function createSettingsObj() {

  // object to be returned
  const obj = {};

  // provide space or ans or none
  obj['provideAnsOrSpace'] = document.getElementById('space-or-ans').value;

  // first, extract and attach simple Boolean settings (true/false type)
  const selects = document.querySelectorAll('#settings-wrapper .simple-boolean');
  selects.forEach((select) => {
    obj[select.dataset.name] = (select.value === "true")? true : false;
  });
  // forEach ends
  
  // nested convertQForm obj
  obj['convertQForm'] = {};
  obj['convertQForm']['MCQ'] = {};

  // flip TF
  obj['convertQForm']['flipTF'] = (document.getElementById('flip-tf').value === "true")? true : false ;

// MCQ to Fill up convert
let val = parseInt(document.getElementById('mcq-to-fill-up').value); obj['convertQForm']['MCQ']['toFillUp'] = isNaN(val)? 0 : val;

// MCQ to TF convert
val = parseInt(document.getElementById('mcq-to-tf').value); obj['convertQForm']['MCQ']['toTF'] = isNaN(val)? 0 : val;

// MCQ to VSA convert
val = parseInt(document.getElementById('mcq-to-vsa').value); obj['convertQForm']['MCQ']['toVSA'] = isNaN(val)? 0 : val;

  // space for ans
  obj['spaceForAns'] = {};
  const spaceInputs = document.querySelectorAll('#settings-wrapper .space-number');
  spaceInputs.forEach((input) => {
     let n = parseInt(input.value);
     let type = input.dataset.type;
     obj['spaceForAns'][type] = isNaN(n)? 2 : n;
  });
  // forEach ends

  // qTypesAllowedInImageQ
  obj['qTypesAllowedInImageQ'] = [];
  const allowImages = document.querySelectorAll('#settings-wrapper .allow-images-checkbox');
  allowImages.forEach((input) => {
     if(input.checked) {
        obj['qTypesAllowedInImageQ'].push(input.dataset.type);
     }
  });
  // forEach ends

  return obj;
}
// function ends

// function to create a mustInclude array
function createMustIncludeArray() {

  // array to be returned
  const array = []; 

  // loop through checkedIndices
  for(let j=0; j<checkedIndices.length; j++) {

    // push an empty object first into the array being created
    array.push({});

    // select the array relevant to current container
    const selected = checkedIndices[j];
    
    // loop through all uniqueQTypes
    uniqueQTypes.forEach((type) => {
          const indices = findCommonElements(selected, qTypeIndexMap[type]);
          if(indices.length > 0) {
              array[j][type] = indices;
          }

    });
    // forEach ends
  }
  // outer for loop ends

  return array;
}
// function ends


// function to fetch required stringified objects to be attached in the URL
function generateLink() {

  // exam details
  const examDetails = getExamDetails();

  // questionPaperMap
  const questionPaperMap = getQuestionPaperMap();

  // qContainers object
  const qContainers = getQContainers();

  // generate URL
  let url = "https://sourabhsuneja.github.io/question-paper/?" + "ed=" + encodeURIComponent(examDetails) + "&qpm=" + encodeURIComponent(questionPaperMap) + "&qc=" + encodeURIComponent(qContainers) + "&files=" +  encodeURIComponent(document.getElementById('chapters').value.trim()) + "&diff=" + document.getElementById('overall-difficulty').value;

  // insert link in the link container
  const a = document.createElement('a');
  a.href = url;
  a.textContent = url;
  a.setAttribute('target', '_blank');

document.getElementById('link').innerHTML = ""; document.getElementById('link').appendChild(a);

}
// function ends
