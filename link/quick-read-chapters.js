// global variables and constants
const chapterInput = document.getElementById('chapters');
const addContainerBtn = document.getElementById('addContainerBtn');
const chapterWisePromptDiv = document.getElementById('chapter-wise-prompt');
const containerWisePromptDiv = document.getElementById('container-wise-prompt');
const settingsDiv = document.getElementById('settings');
const settingsWrapperDiv = document.getElementById('settings-wrapper');
let chapterNames = [];
let allQuestions = [];
let questionArray;
let qTypeIndices = [];
let qTypeIndexMap;
let uniqueQTypes = [];
let containerCount = -1;
let mergeableQTypes = ['Match items'];
let checkedIndices = [];
const qbLink = "https://sourabhsuneja.github.io/question-paper/question-bank/";


// function to dynamically create chapter-wise no. of questions to be inserted prompts 
async function createChapterWisePrompt() {

  // reset all variables and also clear pre-inserted HTML elements
  chapterNames = [];
  allQuestions = [];
  qTypeIndices = [];
  uniqueQTypes = [];
  containerCount = -1;
  checkedIndices = [];
  chapterWisePromptDiv.innerHTML = "";
  containerWisePromptDiv.innerHTML = "";
  addContainerBtn.style.display = "none";
  settingsDiv.style.display = "none";

  // clear existing div
  chapterWisePromptDiv.innerHTML = "";

  // extract text value
  const val = chapterInput.value.trim();

  // if value empty, return back
  if(val === "") {
    return;
  }

  // if value is just a single filename, insert the string as the first and only value in the chapters array
  if(!val.includes("+")) {
    chapterNames.push(val)
  } 
  // otherwise, separate chapter names from the val string and then populate the array
  else {
    chapterNames.push(...val.split("+"));
  }

  // fetch chapter-wise array of question arrays
  questionArray = await get(val);
  
  // generate index map on the basis of question type for each chapter
  for(let i=0; i<questionArray.length; i++) { 
    qTypeIndices.push(generateIndexMap(questionArray[i], "qType"));
  }
  // end loop

  // make containerWisePromptDiv visible
  containerWisePromptDiv.style.display = "block";
  
  // remove duplicates from uniqueQTypes array
  uniqueQTypes = [...new Set(uniqueQTypes)];

  // create chapter-wise divs
  for(let i=0; i<chapterNames.length; i++) {
    const parent = document.createElement('div');
    parent.classList.add('ch-prompt');
    const heading = document.createElement('h3');
    heading.textContent = "Number of Questions to be included from " + chapterNames[i] + ":";
    parent.appendChild(heading);
    
    // create as many labels and inputs as required for current chapter
    const keys = filterArray(Object.keys(qTypeIndices[i]), mergeableQTypes);
    
    keys.forEach((type, index) => {
        // create unique id 
        const id = createUniqueId(chapterNames[i], type);

        // check available questions
        const available = qTypeIndices[i][type].length;

        // create label
        const label = document.createElement('label');
        label.innerHTML = type + "<br>(Available: " + available + ")";
        label.setAttribute("for", id);
        parent.appendChild(label);

        // create an input field
        const input = document.createElement('input');
        input.setAttribute("type", "number");
        input.setAttribute("id", id);
        input.setAttribute("name", id);
        input.setAttribute("data-chapter", chapterNames[i]);
        input.setAttribute("data-type", type);
        input.value = available;
        parent.appendChild(input);
        

    });
    // forEach ends

    // at last, create checkboxes

        // Array of checkbox IDs
    let extraPromptCheckboxes = ['include-match-items', 'include-image', 'include-audio', 'include-video'];
    let checkboxTexts = ['Allow match based questions', 'Allow image-based questions', 'Allow audio-based questions', 'Allow video-based questions'];
    let extraTypes = ['Match items', 'image', 'audio', 'video'];
    let ch = chapterNames[i].toLowerCase();

    // Loop through the extraPromptCheckboxes array to create checkboxes
    for (let j = 0; j < extraPromptCheckboxes.length; j++) {
        // Create a checkbox element
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = ch + "-" +  extraPromptCheckboxes[j]; 
        checkbox.setAttribute("data-chapter", chapterNames[i]);
        checkbox.setAttribute("data-type", extraTypes[j]);
        checkbox.classList.add(extraPromptCheckboxes[j]);

        
        // Create a label element
        let label = document.createElement('label');
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(checkboxTexts[j])); 

        // hide last two (audio & video) checkboxes and labels because they are irrelevant in a question paper
        if(j === 2 || j === 3) {
             label.style.display = "none";
             checkbox.style.display = "none";
        }


        // Append checkbox to the parent container
        parent.appendChild(label);
    }
    // checkboxes end

    
    chapterWisePromptDiv.appendChild(parent);
  }
  // end for loop

  // generate a single map object for all questions from all chapters
  qTypeIndexMap = generateIndexMap(allQuestions, "qType");

  // now uniqueQTypes will include qTypes from all chapters and all questions
  uniqueQTypes = Object.keys(qTypeIndexMap);

// create the first container
createContainer();
}
// end function 


// function to fetch questions from all mentioned chapters
async function get(filenames) {

  // fetch all questions from all files
  const questions = await fetchMultipleFilesData(filenames);

  return questions;

}
// function end


// function to take one or more filenames and return a consolidated array of data fetched from each file using fetchData function

async function fetchMultipleFilesData(fileNames) {
  const files = fileNames.split('+');
  const consolidatedData = [];
  for (const fileName of files) {
    try {
      const data = await fetchData(fileName.endsWith('.txt') ? fileName : fileName + '.txt');
      consolidatedData.push(data);
      allQuestions.push(...data);
    } catch (error) {
      console.error(`Error fetching data from ${fileName}:`, error);
    }
  }
  
  return consolidatedData;
}
// function end

// Function to fetch data from a file using AJAX and return a promise

function fetchData(fileName) {
    fileName = qbLink + fileName;
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            const data = xhr.responseText.split('\n').map(item => item.trim()).filter(item => item !== '');
            resolve(data);
          } else {
            reject(new Error("Failed to load data"));
          }
        }
      };
      xhr.open("GET", fileName, true);
      xhr.send();
    });
}
  // function end


// function to generate index maps on the basis of different JSON parameters attached with questions
function generateIndexMap(questions, basis) {
  // Step 1: Extract the JSON part from all questions
  const extractedObjects = questions.map(extractJSONFromString);
  
  // Step 2 & 3: Iterate over all JSON objects, extract key values on the basis of "basis" property and create object with unique basis values and their indices
  const indexMap = {};
  const uniqueBasisValues = [];
  extractedObjects.forEach((obj, index) => {
    if (obj && obj.hasOwnProperty(basis)) {
      const basisValue = obj[basis];
      if (!indexMap.hasOwnProperty(basisValue)) {
        uniqueBasisValues.push(basisValue);
        indexMap[basisValue] = [];
      }
      indexMap[basisValue].push(index);
    }
  });
  uniqueQTypes.push(...uniqueBasisValues);

  return indexMap;
}
// function end


// function to extract the JSON parameters from question string
function extractJSONFromString(inputString) {
    const jsonStartIndex = inputString.indexOf('JSONParams:');
    if (jsonStartIndex === -1) {
        return null; // JSON part not found in the string
    }

    const jsonString = inputString.substring(jsonStartIndex + 'JSONParams:'.length);
    const trimmedJsonString = jsonString.trim();
    const firstCurlyBraceIndex = trimmedJsonString.indexOf('{');
    const lastCurlyBraceIndex = trimmedJsonString.lastIndexOf('}');
    if (firstCurlyBraceIndex === -1 || lastCurlyBraceIndex === -1) {
        console.error('Error: Invalid JSON structure');
        return null;
    }

    const jsonSubstring = trimmedJsonString.substring(firstCurlyBraceIndex, lastCurlyBraceIndex + 1);
    try {
        const jsonObject = JSON.parse(jsonSubstring);
        return jsonObject;
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return null;
    }
}
// function end

// function to extract the question string before the JSONParams part
function extractStringBeforeJSON(inputString) {
    const jsonStartIndex = inputString.indexOf('JSONParams:');
    if (jsonStartIndex === -1) {
        return inputString; 
    }
    
    return inputString.substring(0, jsonStartIndex);
}
// function ends

// function to filter out items from array1 that exist in array2 until array1 has reached a specified minimum length
function filterArray(array1, array2, minLen) {

    if(array1.length <= minLen) {
        return array1;
    }
    
    let filteredArray = [];
    let removedItems = [];
    
    for (let i = 0; i < array1.length; i++) {
        if (!array2.includes(array1[i])) {
            filteredArray.push(array1[i]);
        }
        else {
            removedItems.push(array1[i]);
        }
    }

    // if filtered array has become too short, fill back some of the removed items randomly (if randomisation is allowed otherwise pick first n items)
    if (minLen != undefined && filteredArray.length < minLen) {
        const diff = minLen - filteredArray.length;
        let items;
        if(qContainers['settings']['randomiseSelection']) { items = selectRandomItems(removedItems, diff);
        } else {
            items = removedItems.slice(0, diff);
        }
        filteredArray = [...filteredArray, ...items];
    }
    
    return filteredArray;
}
// function end

// function to create a unique id identifier based on qType and chapter name
function createUniqueId(chapter, qType) {

  let str = chapter.replace(/[ /]/g, "-");

  str += "-" + qType.replace(/[ /]/g, "-");

  return str.toLowerCase();
  
}
// function end


// function to toggle visibility of additional settings
function toggleSettingsVisibility(e) {
  e.classList.toggle('active');
  if(settingsWrapperDiv.style.maxHeight) {
          settingsWrapperDiv.style.maxHeight = null;
        } else {
          settingsWrapperDiv.style.maxHeight = settingsWrapperDiv.scrollHeight + "px";
        }
}
// function ends

// function to find common elements in arrays
function findCommonElements(...arrays) {
    if (arrays.length === 0) {
        return [];
    }
    
    // Use the first array to initialize the Set of common elements
    let commonElements = new Set(arrays[0]);
    
    // Iterate through the remaining arrays
    for (let i = 1; i < arrays.length; i++) {
        // Use a Set to store unique elements of the current array
        let set = new Set(arrays[i]);
        
        // Filter the commonElements Set to keep only elements present in the current array
        commonElements = new Set([...commonElements].filter(element => set.has(element)));
    }
    
    // Convert the Set back to an array
    return [...commonElements];
}
// function ends

// attach event listener
chapterInput.onblur = createChapterWisePrompt;
