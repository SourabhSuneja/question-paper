// global variables & constants
let chapterNames;
let chapterStartPoints;
let questions;
let mergedQuestions = {};
let toBeInserted;

// disallowed qTypes
const disallowedQTypes = [];

// mapping card values with difficulty levels
const difficultyLevels = { "easy": [10, 25], "medium": [50, 75], "hard": [100] };

// mergeable question types
const mergeableQTypes = ['Match items'];

// question paper map
const questionPaperMap = {
    "gk": {
        "MCQ": 2,
        "Very Short Answer Type": 10,
        "Short Answer Type": 10,
        "Long Answer Type": 10,
        "True/False": 2,
        "Fill up": 10,
        "Match items": 10,
        "Diagram/Picture/Map Based": 1,
        "audio": false,
        "image": false,
        "video": false
    },
    "gk-2": {
        "MCQ": 10,
        "Short Answer Type": 10,
        "True/False": 10,
        "Very Short Answer Type": 10,
        "Long Answer Type": 10,
        "Match items": 10,
        "audio": false,
        "image": false,
        "video": false
    }
};

// question container headings along with number of questions to be included from each qType (MCQ, Fill up etc) with their respective weightages
const qContainers = {
    headings: [
                "", 
                "",
                "",
                "",
                "",
                ""
    ],
    qTypes: [
                 {
                      "MCQ": 5
                 },
                 {
                      "True/False": 5         
                 },
                 {
                      "Fill up": 5
                  },
                 {
                      "Short Answer Type": 2,                
                      "Very Short Answer Type": 3
                 },
                 {
                       "Match items": 5 ,
                 },
                 {
                       "Diagram/Picture/Map Based": 1
                 }
    ],
    weightPerQ: [
                 {
                      "MCQ": 1
                 },
                 {
                      "True/False": 1    
                 },
                 {
                      "Fill up": 1
                  },
                 {
                      "Short Answer Type": 2,                
                      "Very Short Answer Type": 1
                 },
                 {
                       "Match items": 1
                 },
                 {
                       "Diagram/Picture/Map Based": 3
                 }
    ],
    settings: {
          randomiseSelection: true,
          editable: true,
          hideWeightage: false,
          border: false,
          shuffleMCQOptions: true,
          provideAnsOrSpace: "ans",
          useDotPatternInBlanks: true,
          showHelpBoxInFillUp: true,
          mergeMatchItems: true,
          convertQForm: {
             "MCQ": {
                            "toFillUp": 3,
                            "toTF": 3,
                            "toVSA": 3
                           },
              "flipTF": true
          },
          spaceForAns: {
              "True/False": 1,
              "Very Short Answer Type": 1,
              "Short Answer Type": 4,
              "Long Answer Type": 4,
              "Diagram/Picture/Map Based": 5
          },
    qTypesAllowedInImageQ: [     
             "MCQ",
             "Short Answer Type",
             "Fill up",
             "True/False",
             "Match items",
             "Very Short Answer Type"
          ]
    }
};


// overall difficulty level of question paper
const overallDifficulty = "hard";
        
// Function to fetch data from a file using AJAX and return a promise

  function fetchData(fileName) {
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

// function to take one or more filenames and return a consolidated array of data fetched from each file using fetchData function

async function fetchMultipleFilesData(fileNames) {
  const files = fileNames.split('+');
  chapterNames = files;
  const consolidatedData = [];
  chapterStartPoints = [];
  for (const fileName of files) {
    try {
      const data = await fetchData(fileName.endsWith('.txt') ? fileName : fileName + '.txt');
      chapterStartPoints.push(consolidatedData.length);
      consolidatedData.push(...data);
    } catch (error) {
      console.error(`Error fetching data from ${fileName}:`, error);
    }
  }
  
  return consolidatedData;
}

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

  return {"map": indexMap, "uniqueValues": uniqueBasisValues};
}

// function to get index map of questions based on chapters
function getQuestionIndicesByChapter(questions, chapterStartPoints, chapterNames) {
    const chapters = {};

    for (let i = 0; i < chapterNames.length; i++) {
        const chapterName = chapterNames[i];
        const start = chapterStartPoints[i];
        const end = (i + 1 < chapterStartPoints.length) ? chapterStartPoints[i + 1] : questions.length;
        
        chapters[chapterName] = Array.from({ length: end - start }, (_, index) => start + index);
    }

    return chapters;
}

// function to get difficulty level based on card value
function getDifficultyLevel(cardValue) {
    for (const level in difficultyLevels) {
        const range = difficultyLevels[level];
        if (range.length === 1) {
            if (cardValue >= range[0]) {
                return level;
            }
        } else {
            if (cardValue >= range[0] && cardValue <= range[1]) {
                return level;
            }
        }
    }
    return null;
}

// function to get total count of each question type
function countEachQuestionType(questionPaperMap) {
  const totalQuestions = {};

  for (const chapter in questionPaperMap) {
    const chapterQuestions = questionPaperMap[chapter];

    for (const type in chapterQuestions) {
      const count = chapterQuestions[type];
      if (totalQuestions[type]) {
        totalQuestions[type] += count;
      } else {
        totalQuestions[type] = count;
      }
    }
  }

  return totalQuestions;
}

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

// function to randomly select 'n' number of items from an array
function selectRandomItems(arr, n) {
  // // if n is greater than the length of the array, return the array back simply after shuffling the existing items
  if (n > arr.length) {
    return shuffleArray(arr);
  }

  // Shuffle the array to randomize the order
  const shuffled = arr.sort(() => Math.random() - 0.5);

  // Return the first n elements from the shuffled array
  return shuffled.slice(0, n);
}


// function to pick items alternately from start and end of an array
function pickItemsAlternately(arr) {
    // Sort the array in ascending order
    arr.sort((a, b) => a - b);

    // Initialize an empty array to store the result
    let result = [];

    // Initialize pointers for the beginning and end of the array
    let start = 0;
    let end = arr.length - 1;

    // Loop until start pointer is less than or equal to end pointer
    while (start <= end) {
        // Add item from start pointer
        result.push(arr[start]);
        // Move start pointer to the next item
        start++;

        // Check if start pointer has not crossed end pointer
        if (start <= end) {
            // Add item from end pointer
            result.push(arr[end]);
            // Move end pointer to the previous item
            end--;
        }
    }

    // Return the result array
    return result;
}

// function to filter questions based on supplied overall difficulty level for question paper
function filterOnDifficultyLevel(q, overallDifficulty, numQuesReq, uniqueCardIndices, cardIndexMap) {

  // sort card values based on difficulty level demanded
  if(overallDifficulty == "easy") {
    uniqueCardIndices.sort((a, b) => b - a);
  }
  else if(overallDifficulty == "hard") {
    uniqueCardIndices.sort((a, b) => a - b);
  }
  else if(overallDifficulty == "medium") {
    uniqueCardIndices = pickItemsAlternately(uniqueCardIndices);
  }
  
  // loop through all card indices and remove items progressively
  uniqueCardIndices.forEach(
    function(cardValue) {
      const thisCardMap = cardIndexMap[cardValue];
      q = filterArray(q, thisCardMap, numQuesReq);
    }
  );
return q;
}

// function to extract the question string before the JSONParams part
function extractStringBeforeJSON(inputString) {
    const jsonStartIndex = inputString.indexOf('JSONParams:');
    if (jsonStartIndex === -1) {
        return inputString; 
    }
    
    return inputString.substring(0, jsonStartIndex);
}

// function to get the total counts of each type of questions to be inserted into all containers
function countToBeInserted(qContainers) {
  const count = {};
  for(let container of qContainers) {
    for(let type in container) {
      if(!count.hasOwnProperty(type)) {
        count[type] = 0;
      }
      count[type] += container[type];
    }
  }
  return count;
}


// function to start the question fetching and preparation process
async function start() {

  // fetch all questions from all files
  questions = await fetchMultipleFilesData("gk+gk-2");

  // get total count of each type of questions on the basis of question paper map
  let totalQOfEachType = countEachQuestionType(questionPaperMap)


  // generate index map on the basis of card values
  let { map: cardIndexMap, uniqueValues: uniqueCardIndices } = generateIndexMap(questions, "card");


   // generate index map on the basis of question type
  let { map: qTypeIndexMap, uniqueValues: uniqueQTypeIndices } = generateIndexMap(questions, "qType");

  // generate index map on the basis of media embedded in questions
  let { map: mediaEmbeddedIndexMap, uniqueValues: uniqueMediaEmbeddedIndices } = generateIndexMap(questions, "mediaEmbedded");

  // merging mediaEmbeddedIndexMap with qTypeIndexMap
  qTypeIndexMap['audio'] = mediaEmbeddedIndexMap['audio'];
  qTypeIndexMap['video'] = mediaEmbeddedIndexMap['video'];
  qTypeIndexMap['image'] = mediaEmbeddedIndexMap['image'];

  
  // generate index map on the basis of chapters
  let chapterIndexMap = getQuestionIndicesByChapter(questions, chapterStartPoints, chapterNames);

 // store the cumulative count of each type of questions to be inserted across all containers
  toBeInserted = countToBeInserted(qContainers['qTypes']);

  // select questions
  const selectedQMap = selectQuestions(questions, chapterNames, chapterIndexMap, cardIndexMap, qTypeIndexMap, mediaEmbeddedIndexMap, totalQOfEachType, questionPaperMap, overallDifficulty, uniqueCardIndices, uniqueQTypeIndices,  qContainers['settings']['qTypesAllowedInImageQ']);

// convert MCQs to Fill ups (if requested)
convertMCQToOther(questions, selectedQMap, "Fill up"); 

// convert MCQs to True/False (if requested)
convertMCQToOther(questions, selectedQMap, "True/False"); 

// convert MCQs to Very Short Answer Type (if requested)
convertMCQToOther(questions, selectedQMap, "Very Short Answer Type"); 

// flip True/False questions
transformTF(questions, selectedQMap['True/False']);

// merge all match based questions
selectedQMap['Match items']  = mergeMatchItems(questions, selectedQMap['Match items']);

// fill questions in the DOM elements
fillQuestions(selectedQMap, questions, qContainers);


}


// function to select questions based on supplied criteria
function selectQuestions(questions, chapterNames, chapterIndexMap, cardIndexMap, qTypeIndexMap, mediaEmbeddedIndexMap, totalQOfEachType, questionPaperMap, overallDifficulty, uniqueCardIndices, uniqueQTypeIndices,  allowedQTypesForImages) {

  // object holding indices of selected questions of different types
  let selected = {};


  // remove disallowed qTypes for image-based questions from the index maps
  uniqueQTypeIndices.forEach(
       function(item) {
            const allowed = allowedQTypesForImages.includes(item);
            if(!allowed) {

                qTypeIndexMap[item] = filterArray(qTypeIndexMap[item], qTypeIndexMap['image']);

            }
       }
  );


  // looping all chapters in question paper map
  for (let chapter in questionPaperMap) {
    if (questionPaperMap.hasOwnProperty(chapter)) {


      // get question indices for current chapter
      const chapterIndices = chapterIndexMap[chapter];

      // looping all question types in current chapter
      for (let type in questionPaperMap[chapter]) {

       //if this type is not allowed in the entire paper, continue to the next type
        if(disallowedQTypes.includes(type)) {
              selected[type] = [];
              continue;
        }

        if (questionPaperMap[chapter].hasOwnProperty(type)) {

          // get all indices of current question type
          const typeIndices = qTypeIndexMap[type];

          // no. of questions needed for this question type from current chapter
          let numQuesReq = questionPaperMap[chapter][type]; 


          // if question form conversion is requested, select a few extra questions of this type so that they can be later changed into some other qType
       if (qContainers['settings']['convertQForm'][type]) {
    // loop through all keys
            for (const x in qContainers['settings']['convertQForm'][type]) {
        numQuesReq += Math.ceil( (qContainers['settings']['convertQForm'][type][x])/chapterNames.length);
            }
           // loop ends
      }
// if ends


          // get questions common to current chapter and current type
          let q = findCommonElements(chapterIndices, typeIndices);

          // if q exceeds number of questions required for this type for this chapter, filter out some questions based on other criteria

          // remove video based if video type ques required = 0 
          if (questionPaperMap[chapter]['video'] == false) {
            q = filterArray(q, qTypeIndexMap['video']);
          }

          // remove audio based if audio type ques required = 0 
          if (questionPaperMap[chapter]['audio'] == false) {
            q = filterArray(q, qTypeIndexMap['audio']);
          }

          // remove image based if image type ques required = 0 
          if (questionPaperMap[chapter]['image'] == false) {
            q = filterArray(q, qTypeIndexMap['image']);
          }

          // filter questions on basis of card values (difficulty) if we still have excess of questions
          q = filterOnDifficultyLevel(q, overallDifficulty, numQuesReq, uniqueCardIndices, cardIndexMap);

          // if, after criteria-based filtering, there are still excess questions, randomly select the required number of questions (if randomiseSelection is set to true or else just select the first n elements)
          if(qContainers['settings']['randomiseSelection']) {
            q = selectRandomItems(q, numQuesReq);
          } else {
              q = q.slice(0, numQuesReq);
          }

          // finally, add the questions of this type to the selected questions object
          if (!selected.hasOwnProperty(type)) {
    selected[type] = [];
          }
          selected[type] = selected[type].concat(q);

        } // End of if (questionPaperMap[chapter].hasOwnProperty(type))
      } // End of for (let type in questionPaperMap[chapter])
    } // End of if (questionPaperMap.hasOwnProperty(chapter))
  } // End of for (let chapter in questionPaperMap)

return selected;
} // End of function selectQuestions


// function to convert MCQs to other possible types
function convertMCQToOther(questions, selectedQMap, convertTo) {

  // find the no. of MCQs to be converted into the requested type (if not given, return back)

  let lookupKey;
  switch(convertTo) {
    case "Fill up": lookupKey = "toFillUp";
    break;
    case "True/False": lookupKey = "toTF";
    break;
    case "Very Short Answer Type": lookupKey = "toVSA";
    break;
    default: return
  }

  if (!qContainers['settings']['convertQForm']['MCQ'][lookupKey] || disallowedQTypes.includes(convertTo)) {
    return;
  }

  const qReq = qContainers['settings']['convertQForm']['MCQ'][lookupKey];

  let converted = 0;
  
  // loop through all MCQs and see which of them are convertible into requested type
  for(let i = 0; i < selectedQMap['MCQ'].length && converted < qReq && selectedQMap['MCQ'].length > toBeInserted['MCQ']; i++) {
      const qIndex = selectedQMap['MCQ'][i];
      const qPart = extractStringBeforeJSON(questions[qIndex]);
      const JSONPart = extractJSONFromString(questions[qIndex]);
      const convertibleTo = isMCQConvertible(qPart, lookupKey);

     // if question is not convertible to the requested type, proceed to next question
      if(convertibleTo !== lookupKey) {
          continue;
      }
      

          // add this qIndex to the index map of requested qType at a new index position (selected randomly in case randomiseSelection is allowed or else at index 0)

const newIndex = (qContainers['settings']['randomiseSelection'])? Math.floor(Math.random() * selectedQMap[convertTo].length) : 0
          selectedQMap[convertTo].splice(newIndex, 0, qIndex);
         // remove this qIndex from MCQ index map
          selectedQMap['MCQ'].splice(i, 1);

        // change the JSONParams and question type
        const mcqPattern = /\(Options: (.*) Correct: (.*)\)$/i;
        let [, optionsPart, correctAnswer] = mcqPattern.exec(qPart);
        let question = qPart.replace(mcqPattern, '').trim();
        let options = optionsPart.split(/Option [A-D]}\s*/).filter(Boolean).map(option => option.trim());

        // process question and correct answer, depending on what form it's being converted to
        if(convertTo === "True/False") {
            let regex1 = /_{3,40}/g
            let regex2 = /\.{5,50}/g
            let filteredOptions = options.filter(option => !/(both|none|all|either|neither)/i.test(option));
            let selectedOption = filteredOptions[Math.floor(Math.random() * filteredOptions.length)];
           question = question.replace(regex1, selectedOption).replace(regex2, selectedOption);
            // determine whether it has become true or false
            if(selectedOption === correctAnswer) {
               correctAnswer = "True";
            } else {
               correctAnswer = "False";
            }
        } 
        // end True/False conversion condition
        JSONPart['ansExplanation'] = correctAnswer;
        JSONPart['qType'] = convertTo;
        questions[qIndex] = question + "JSONParams:" + JSON.stringify(JSONPart);

         // increment counter
         converted++;

      
  }
  // loop ends
}
// function ends

// function to check whether an MCQ is convertible into other types or not
function isMCQConvertible(q, lookupKey) {

  const mcqPattern = /\(Options: (.*) Correct: (.*)\)$/i;

  
   // separate question part, options & correct answer using regex pattern
  const [, optionsPart, correctAnswer] = mcqPattern.exec(q);
  let options = optionsPart.split(/Option [A-D]}\s*/).filter(Boolean).map(option => option.trim());
  const questionText = q.replace(mcqPattern, '').trim();


  // test if correct option doesn't include words like "none", "all", "either", "neither", "both"
  let regex = /^(both|none|neither|either)/i
  const test1 = !regex.test(correctAnswer);

  // test for the presence of a blank 
  let regex1 = /_{3,40}/g 
  let regex2 = /\.{5,50}/g 
  const test2 = regex1.test(questionText) || regex2.test(questionText);

  // test for the absence of question mark at the end
  const test3 = !(questionText.endsWith("?"));

  // test whether question starts with a wh word (who, whom, which etc) but not followed by "of" or "among"
  let regex3 = /(what|which|where|whose|who|whom|when|why|how)(?!\s(of|among))\s/i
  const test4 = regex3.test(questionText);

  
  // if all tests for toFillUp are passed, return toFillUp
  if(test1 && test2 && test3 && lookupKey === "toFillUp") {
    return lookupKey;
  }

  // if all tests for toTF are passed, return toTF
  if(test1 && test2 && test3 &&  lookupKey === "toTF") {
    return lookupKey;
  }

  // if all tests for toTF are passed, return toTF
  if(test1 && !test2 && !test3 && test4 && lookupKey === "toVSA") {
    return lookupKey;
  }

  return false;
}


// function to randomly transform True/False questions (changing positive statements to negative and vice versa)
function transformTF(questions, map) {
  // if flipping not requested or less than 3 indices in the map, return back
  if (!qContainers['settings']['convertQForm']['flipTF'] || map.length < 3) {
    return;
  }

  // pick 1/3rd of True/False questions randomly if random selection is allowed, otherwise pick every second T/F question

let selected = [];
  if(qContainers['settings']['randomiseSelection']) {
    selected = map.filter(() => Math.random() < 1/3);
  } else {
    selected = map.filter((_, index) => index % 2 !== 0);
  }

  // loop through selected indices and flip questions wherever possible
  for(let i = 0; i < selected.length; i++) {
      const q = questions[map[i]];
      const originalQ = extractStringBeforeJSON(q);
      const JSONPart = extractJSONFromString(q);
      // try flipping or negating
      const newQ = flipSentence(originalQ);
      // if sentence was flipped successfully, flip the answer stored in JSON as well
      if(newQ !== originalQ) {

         const ans = JSONPart['ansExplanation'];
         if(ans.toLowerCase() == 't' || ans.toLowerCase() == 'true') {
               JSONPart['ansExplanation'] = "False";
         } else {
              JSONPart['ansExplanation'] = "True";
         }

      // re-package the JSON back to the question
        questions[map[i]] = newQ + "JSONParams:" + JSON.stringify(JSONPart);

      }
      
  }
  // loop ends 
  
}
// function ends

// function to flip True/False questions
function flipSentence(sentence) {

    if(sentence.includes("also") || sentence.endsWith("?")) {
        return sentence;
    }

    const declarativeRegex = /^[A-Z][^.?!]*[.?!]$/;

    if (declarativeRegex.test(sentence)) {
        const words = sentence.split(" ");

        let verbIndex = -1;
        for (let i = 0; i < words.length; i++) {
            const word = words[i].toLowerCase();
            if (word === "is" || word === "are" || word === "was" || word === "were" || word === "has" || word === "have" || word === "had" || word === "does" || word === "do" || word === "did" || word === "will" || word === "would" || word === "shall" || word === "should" || word === "can" || word === "could" || word === "may" || word === "might" || word === "must") {
                verbIndex = i;
                break;
            }
        }

        if (verbIndex !== -1) {
            // Check if "not" is already present after the verb
            if (words[verbIndex + 1] === "not") {
                // Remove "not" if the sentence is negative
                words.splice(verbIndex + 1, 1);
            } else {
                // Add "not" if the sentence is positive
                words.splice(verbIndex + 1, 0, "not");
            }
            return words.join(" ");
        }
    }

    return sentence;
}


// function to merge match items questions (if allowed) and "package" them into a single question string with merged JSON params
function mergeMatchItems(questions, matchItemsMap) {

    // if no selected match based questions, return back
    if(matchItemsMap.length === 0 || !toBeInserted['Match items'] || disallowedQTypes.includes['Match items']) {
          return [-1];
    }

    // sort map first, to achieve least question deficit in case merging isn't allowed   

matchItemsMap = sortMergeableForLeastDeficit(matchItemsMap, 'Match items');

    const mergedObj = {
            "qType": "Match items",
            "ansExplanation": "",
            "mediaEmbedded": [],
            "mediaLink": [],
            "questions": [],
            "colAHeadings": [],
            "colBHeadings": [],
            "breakpoints": [],
            "colA": [],
            "colB": [],
            "pointer": 0
    };
    // fetch match items questions one by one, extract the relevant parameters and push them into the merged object

    while(matchItemsMap.length > 0) {
        const index = matchItemsMap[0];
        const q = questions[index];
        const JSONPart = extractJSONFromString(q);
        const textPart = extractStringBeforeJSON(q);
        const colAHeading = JSONPart['colHeadings'][0];
        const colBHeading = JSONPart['colHeadings'][1];
        // push items
        mergedObj['mediaEmbedded'].push(JSONPart['mediaEmbedded']);
        mergedObj['mediaLink'].push(JSONPart['mediaLink']);
        mergedObj['questions'].push(textPart);

        mergedObj['colAHeadings'].push(colAHeading);
        mergedObj['colBHeadings'].push(colBHeading);
        mergedObj['colA'].push(...(JSONPart['matchCols'][colAHeading]));
        mergedObj['colB'].push(...(JSONPart['matchCols'][colBHeading]));
        mergedObj['breakpoints'].push(mergedObj['colA'].length);
        // clear index from Match items map
        matchItemsMap.splice(0, 1);
    }

    // store new mergedObj in the mergedQuestions global object 
    mergedQuestions['Match items'] = "JSONParams:" + JSON.stringify(mergedObj) ;

    // insert a dummy value in the match items map, so that it doesn't look like there are no such questions, when used in other functions
    matchItemsMap.push(-1);
    return matchItemsMap;
    

}


// function to sort the indices of mergeable questions (such as Match items) in the order they should be inserted to achieve least question deficit while filling questions in containers (in case, merging is not allowed). The questions will still be merged and stored as a single merged string but the questions will be filled as if they were never merged. 
function sortMergeableForLeastDeficit(indexMap, qType) {

    const oldIndexMap = [...indexMap];
    const newIndexMap = [];
    const array = qContainers['qTypes'];
    let basisArray;
    let diffArray = [];
    let diffMatrix = [];
    
    for(let j = 0; j < array.length; j++) {

     if(array[j][qType]) {
        const qReq = array[j][qType] || 0;
        diffArray = [];
        
        // looping through map indices
         for(let i = 0; i < oldIndexMap.length; i++) {
               let qIndex = oldIndexMap[i];
               let q = questions[qIndex];
               let params = extractJSONFromString(q);

// get basis array
               if(qType === 'Match items') {
                   const colName = params['colHeadings'][0]; 
                   basisArray = params['matchCols'][colName];
               }

               // find length of basis array and difference from qReq
               const basisLen = basisArray.length;
               const diff =  basisLen - qReq;
                diffArray.push(diff);
         }
         // inner loop ends
         diffMatrix.push(diffArray);
     }
    }

    // if matrix is empty, return an empty array (no elements)
    if(diffMatrix.length === 0) {
        return [];
    }

    // outer for loop ends
    let replacementIndices = extractReplacementIndicesFromMatrix(diffMatrix, indexMap.length);


   // loop through replacement index and create a new map for returning
    replacementIndices.forEach((i) => {

        newIndexMap.push(indexMap[i]);

    });
    
    return newIndexMap;
}
// function ends



// helper function for merging
function extractReplacementIndicesFromMatrix(matrix, indicesReq) {

  if(matrix.length === 0) {
    return;
  }
  const replacementIndices = [];
  const lastMatrixArr = matrix[matrix.length - 1];

  for(let j = 0; j < indicesReq; j++) {

    // pick an array from matrix
    let arr = matrix[j] || lastMatrixArr;

    // replace items at indices which have already been utilised with -999999 (huge enough negative number)

    arr = arr.map((item, index) => replacementIndices.includes(index) ? -999999 : item);

    let sortedArr = sortForMinDiff(arr);

   //pick the index of the first item (least difference item) from the sorted array and push it into replacementIndices if settings don't allow randomized selection or it is not the last array in the matrix. Otherwise, randomly pick any non-negative item from the sorted diff array

    if(qContainers['settings']['randomiseSelection'] && j === matrix.length - 1) {

        let nonNegativeItem = sortedArr.filter(item => item >= 0)[Math.floor(Math.random() * sortedArr.filter(item => item >= 0).length)];
        replacementIndices.push(arr.indexOf(nonNegativeItem));

    } else {

    replacementIndices.push(arr.indexOf(sortedArr[0]));
    }

    
  }
  // matrix loop ends
  return replacementIndices;
}
// function ends


// helper function for sorting a difference array so that min difference elements are more likely to be picked
function sortForMinDiff(array) {
  
  // separate positive and negative numbers
  let pos = array.filter(item => item >= 0);
  let neg = array.filter(item => item < 0);

  // sort and combine
  pos.sort((a, b) => a - b);
  neg.sort((a, b) => b - a);
  const newArr = [...pos, ...neg];
  
  return newArr;
}



// call start function to begin the entire question fetching and selection process
window.onload = start;
