import {model, chatHistory} from './main-module.js';

const chatInput = document.querySelector("#chat-input");
const refreshButton = document.querySelector("#refresh-button");
const sendButton = document.querySelector("#send-button");
const chatContainer = document.querySelector(".chat-container");
const promptsContainer = document.querySelector(".prompts-container");

const getChatResponse = async() => {
    const userText = chatInput.value;

    //sanity check
    console.log("User Input: ", userText);

    const paragraphElement = document.createElement("div");

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

        //sanity check
        console.log("Model output (string): ", response);
        console.log("Chat History: ", chatHistory);

        paragraphElement.classList.add("gemini-response")
        paragraphElement.innerHTML = `
            <div class="chat-body-inner right">
                <p>
                    ${formattedResponse}
                </p>
            </div> 
            `;
    }catch(Exception){
        console.error("Error fetching response: ", Exception);
        paragraphElement.classList.add("gemini-response");
        paragraphElement.innerHTML = `
            <div class="chat-body-inner right">
                <p>
                    Something went wrong.
                </p>
            </div> 
            `;
    }
    chatContainer.appendChild(paragraphElement);
}

const handleAPI = () => {
    const userText = chatInput.value.trim();

    if(!userText) return;

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

function clearChatHistory(){
    chatHistory.length = 0;
}

function clearSuggestions(){
    promptsContainer.innerHTML = '';
}

function clearInput(){
    chatInput.value = "";
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

    const suggest_prompt = "Suggges me 4 initial prompts without having introductions, that can be used to an AI Chatbot, separated by a |.";

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
        .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2'>$1</a>")
        .replace(/\n/g, "<br>");

    return formattedText;
}