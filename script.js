import {model, chatHistory, genAI} from './main-module.js';

const chatInput = document.querySelector("#chat-input");
const refreshButton = document.querySelector("#refresh-button");
const sendButton = document.querySelector("#send-button");
const avatarImage = document.querySelector("#bocchi-avatar");
const chatContainer = document.querySelector(".chat-container");
const promptsContainer = document.querySelector(".prompts-container");
const images = ["img/bocchi-the-spark.png", "img/bocchi-the-gloom.png", "img/bocchi-the-meh.png", "img/bocchi-the-worried-maybe.png", "img/bocchi-the-spark.png",];

const getChatResponse = async() => {
    const userText = chatInput.value;

    //sanity check
    console.log("User Input: ", userText);

    const paragraphElement = document.createElement("div");
    paragraphElement.classList.add("gemini-response");

    try{
        const parts = chatHistory.concat(userText);
        const result = await model.generateContent(parts);

        //sanity check
        console.log("Model output: ", result);
        console.log("Chat History: ", chatHistory);
        console.log("chatHistory concatenated: ", parts);

        const response = await result.response.text();

        //handle history of user input and model response 
        chatHistory.push(userText, response);

        const formattedResponse = formatResponse(response);

        console.log("Formatted Response: ", formattedResponse);

        const paragraphs = formattedResponse.split('\n');

        console.log("Paragraphs: ", paragraphs);

        //sanity check
        console.log("Model output (string): ", response);
        console.log("Chat History: ", chatHistory);

        appendParagraphs(paragraphs, paragraphElement);
    }catch(Exception){
        console.error("Error fetching response: ", Exception);
        paragraphElement.classList.add("gemini-response");
        paragraphElement.innerHTML = `
            <div class="chat-body-inner right">
                <p>
                    Something went wrong. Click New Chat to start again.
                </p>
            </div> 
            `;
        disableInput();
    }
    chatContainer.appendChild(paragraphElement);
}

const handleAPI = () => {
    const userText = chatInput.value.trim();

    if(!userText) return;

    disableInput(); 
    clearSuggestions();
    getChatResponse();
    clearInput();

    const chatBubble = document.createElement("div");
    chatBubble.classList.add("chat-content");
    chatBubble.innerHTML = `
        <div class="chat-body-inner left">
            <div>
                ${userText}
            </div>
        </div>
    `;

    chatContainer.appendChild(chatBubble);
}

async function appendParagraphs(paragraphs, paragraphElement) {
    for (let i = 0; i < paragraphs.length; i++) {

        if (paragraphs[i].length === 0) continue;

        const typingIndicator = document.createElement("div");
        typingIndicator.classList.add("typing");
        typingIndicator.innerHTML = `
        <div class="half light">
            <div class="typing">
                <span class="circle bouncing"></span>
                <span class="circle bouncing"></span>
                <span class="circle bouncing"></span>
            </div>
        </div>
        `;
        paragraphElement.appendChild(typingIndicator); // Append the typing indicator

        await sleep(3);
        typingIndicator.remove();

        const chatBodyInner = document.createElement("div");
        chatBodyInner.classList.add("chat-body-inner", "right");

        const paragraph = document.createElement("p");
        paragraph.innerHTML = paragraphs[i];

        chatBodyInner.appendChild(paragraph);

        paragraphElement.appendChild(chatBodyInner); // Append after the delay
        let image_number = Math.floor(Math.random() * 4);

        avatarImage.src = images[image_number];
        avatarImage.alt = "Bocchi speaking";

        await sleep(1);
        
        avatarImage.src = images[0];
        avatarImage.alt = "Bocchi default";
    }
    enableInput();
}

function clearChatHistory(){
    chatHistory.length = 0;
}

function clearSuggestions(){
    promptsContainer.innerHTML = '';
}

function clearInput(){
    chatInput.value = "";
}

function disableInput(){
    chatInput.setAttribute("disabled", true);
}

function enableInput(){
    chatInput.removeAttribute("disabled");
}

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

sendButton.addEventListener("click", handleAPI);
sendButton.addEventListener("click", clearInput);

chatInput.addEventListener("keydown", (e) =>{

    if(!e.shiftKey && e.key === 'Enter'){
        e.preventDefault();
        handleAPI();
    }
});

refreshButton.addEventListener("click", function refreshClick(){
    chatContainer.innerHTML = '';
    clearInput();
    clearSuggestions();
    clearChatHistory();
    addSuggestedPrompts();
})

async function addSuggestedPrompts(){

    const suggest_prompt = "Sugggest me ONLY AND AT MAX 4 initial prompts without having introductions, that can be used to an AI Chatbot that can be related to various topics such as computer science, mathematics, statistics, engineering, separated by a |.";

    const suggested_result = await model.generateContent(suggest_prompt);
    const suggested_prompts = suggested_result.response.text();

    const split_prompts = suggested_prompts.split("|");

    //sanity check
    console.log("Suggested Result: ", suggested_result);
    console.log("Suggested Prompts: ", suggested_prompts);
    console.log("Split Prompts: ", split_prompts);

    const suggestedPrompts = document.createElement("div");
    suggestedPrompts.classList.add("suggested-prompts");
    
    document.getElementById("chat-input").removeAttribute("disabled");

    for (let i = 0; i < split_prompts.length; i++){
        const prompt_suggestion = document.createElement("div");
        prompt_suggestion.classList.add("prompt-button");
        prompt_suggestion.innerHTML = `
        <div class="suggested-prompts">
            <p>
                ${split_prompts[i]}
            </p>
        </div> 
        `;
        prompt_suggestion.addEventListener("click", () => {
            chatInput.value = split_prompts[i];
            handleAPI();
        });
        promptsContainer.appendChild(prompt_suggestion);
    }

    chatContainer.appendChild(promptsContainer);
}

document.addEventListener("DOMContentLoaded", function(){
    addSuggestedPrompts();
});

function formatResponse(response){
    response = response.replace(/^\*\s*/, "").trim();

    let formattedText = response
        .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/__(.*?)__/g, "<u>$1</u>")
        .replace(/~~(.*?)~~/g, "<del>$1</del>")
        .replace(/`(.*?)`/g, "<code>$1</code>")
        .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2'>$1</a>");

    return formattedText;
}