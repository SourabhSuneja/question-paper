import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyC_Sv_wV0EHiUSAby3-rLgKRii-SpxMDbY";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "You are a teacher, making a question paper after re-wording the questions. \nTry to re-phrase the question that is being provided to you. \nDon't provide me the answer for any question under any case. \nYou just have to re-phrase the question. \nTry to maintain a similar length of response as the original question. \nBe specific and use simple language similar to the one used in school textbooks.\nPlease retain the dash or blank in fill in the blank type of questions without altering the format of the question.\nEach question you will receive will be unique. Do not try to guess the context from the previously provided questions in the chat. Consider each question as separate and unique from the rest of the questions asked previously.\nYou may also encounter <br> tags within a question, which indicate line breaks. You too have to use <br> for line breaks in the modified question that you will generate.\nIf you recieve a JSON array of questions, re-word each question in the array and give me an array of modified questions.",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export async function run(question) {
  const chatSession = model.startChat({
    generationConfig,
 // safetySettings: Adjust safety settings
 // See https://ai.google.dev/gemini-api/docs/safety-settings
    history: [
      {
        role: "user",
        parts: [
          {text: "Who was the first person to receive Bharat Ratna?"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Who was honored with the first ever Bharat Ratna award? \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "What are the different types of pollution?"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "What are the different ways that our environment can be harmed by human activities? \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "The first Indian to receive the Padma Bhushan was _________"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "________ was the first person from India to be awarded the Padma Bhushan. \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "What do you understand by data? Explain."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Can you explain what \"data\" means in your own words? \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Differentiate between qualitative and quantitative data."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "What is the difference between qualitative data and quantitative data? Explain. \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "The largest desert in the world is ________."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "________ is the largest desert in the world. \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "The globe is divided into _______ hemispheres."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "The earth is divided into ______ hemispheres.\n\n\n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Aman is watching movies on YouTube. What kind of data are these movies an example of?"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Aman is watching movies on YouTube.  What type of data would these movies be considered? \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Describe the process of photosynthesis."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Explain how plants use sunlight to make their own food.  \n\n\n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Solve for x: 3x + 5 = 20."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "If 3x + 5 = 20, what is the value of x? \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "What is the area of a circle with radius 5 cm? (Use π = 3.14)"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "If a circle has a radius of 5 centimeters, what is its area?  Use 3.14 for pi. \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Define what a prime number is and give three examples."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "What is a prime number? Give three examples. \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Analyze the theme of justice in Shakespeare's play \"Hamlet\"."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "How does the theme of justice play out in Shakespeare's \"Hamlet\"? \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "What literary devices are used in the poem \"The Road Not Taken\" by Robert Frost?"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "What literary devices are used in Robert Frost's poem \"The Road Not Taken\"? \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Compare and contrast the protagonists in the novels \"Pride and Prejudice\" by Jane Austen and \"Jane Eyre\" by Charlotte Brontë."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "What are some similarities and differences between the main characters in Jane Austen's \"Pride and Prejudice\" and Charlotte Brontë's \"Jane Eyre\"? \n\n\n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Discuss the impact of globalization on cultural diversity."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "How has globalization affected cultural diversity around the world? \n\n\n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Explain the concept of supply and demand in economics."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Describe the relationship between supply and demand in economics. \n\n\n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "What are the causes and consequences of climate change on global agriculture?"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "How does climate change affect agriculture around the world? What are its causes and consequences? \n\n\n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Explain the process of evolution by natural selection, citing specific examples from different species. How does this process contribute to biodiversity, and what role does genetic variation play in it?"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Explain how natural selection causes evolution. Give examples of this process in different species. How does evolution lead to biodiversity, and what role does genetic variation play in it? \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "A construction company plans to build a circular pond with a diameter of 10 meters. Calculate the area of the pond and determine how much fencing (in meters) will be required if they plan to surround the pond with a fence that extends 1 meter from the edge of the pond."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "A circular pond is being built with a diameter of 10 meters. <br>1. What is the area of the pond?<br>2. A fence will be built around the pond, 1 meter away from the edge. How many meters of fencing will be needed? \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "In Mary Shelley's novel \"Frankenstein,\" explore the theme of ambition and its consequences as exemplified through Victor Frankenstein and his creation. How does Shelley use these characters to comment on the dangers of unchecked scientific progress and the pursuit of knowledge?"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "In Mary Shelley's \"Frankenstein,\" how does the theme of ambition and its consequences play out in the character of Victor Frankenstein and his creation?  How does Shelley use these characters to explore the dangers of unchecked scientific progress and the pursuit of knowledge? \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "What is the pH scale used to measure?"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "What does the pH scale measure? \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Solve for y: 2y + 7 = 15."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "If 2y + 7 = 15, what is the value of y? \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Who wrote \"To Kill a Mockingbird\"?"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Who is the author of the novel \"To Kill a Mockingbird\"? \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "What is urbanization?"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Define urbanization.\n\n\n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Define logistics."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "What is logistics? \n\n\n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Who wrote \"The Road not taken\"?"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Who wrote the poem \"The Road Not Taken\"? \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "['What are the different types of pollution?', 'Name the present prime minister of India.', 'Who built Big Ben?', 'When did Gemelli Careri, an Italian traveller, visit India?']"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "```json\n[\n  \"What are the different ways that our environment can be harmed by human activities?\", \n  \"Who is the current Prime Minister of India?\", \n  \"Who is credited with building Big Ben?\",\n  \"When did the Italian traveler, Gemelli Careri, visit India?\"\n]\n```"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "['Write short notes on:<br>a. Evaporation<br>b. Rusting', 'Explain:<br>1. Industrial revolution<br>2. UV radiation']"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "```json\n[\n\"Write short notes on:<br>a. Evaporation<br>b. Rusting\",\n\"Explain:<br>1. Industrial Revolution<br>2. UV radiation\"\n]\n```"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "['Define:<br>a. Reflection<br>b. Refraction<br>c. Angle of incidence', 'Explain:<br>1. Genetic drift<br>2. Super soppers']"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "```json\n[\n\"Define:<br>a. Reflection<br>b. Refraction<br>c. Angle of incidence\", \n\"Explain:<br>1. Genetic drift<br>2. Super soppers\" \n]\n```"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "The world's largest museum is situated in ________."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "The world's largest museum is located in ________. \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "The Indian city known as the \"Silicon Valley of India\" is:"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "The Indian city known as the \"Silicon Valley of India\" is: ________. \n\n\n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Who was the first Indian chess player to participate in the Olympics?"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Who was the first person from India to play chess at the Olympics? \n\n\n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "The full form of OTP is __________"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "The full form of OTP is __________. \n\n\n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "The famous statue shown in the image is _____________"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "The famous statue shown in the picture is ___________."},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Learning anywhere and anytime using the Internet is called ________."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Learning anywhere and anytime using the internet is called __________. \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "The official language of Argentina is _________."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "__________ is the official language of Argentina.\n\n\n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "The Great Barrier Reef is located off the coast of .............."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "The Great Barrier Reef is located off the coast of __________. \n"},
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(question);

  const responseArrOrText = extractJSONArrayFromMarkup( result.response.text() );

  return responseArrOrText;
}


// function to extract JSON array from the markup returned by Google Gen AI
function extractJSONArrayFromMarkup(markup) {
    // Remove leading and trailing newlines, spaces, and backticks
    markup = markup.trim().replace(/^```json\s+|```$/g, '');

    try {
        // Parse the remaining markup as JSON
        const jsonArray = JSON.parse(markup);
        return jsonArray;
    } catch (error) {
        return markup;
    }
}

// attaching run function as reword with the global window object so that it can be called from anywhere, including non-modular JavaScript files
window.reword = run;