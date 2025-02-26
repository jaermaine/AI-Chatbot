import {model, chatHistory} from './main-module.js';

const chatInput = document.querySelector("#chat-input");
const refreshButton = document.querySelector("#refresh-button");
const sendButton = document.querySelector("#send-button");
const chatContainer = document.querySelector(".chat-container");

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

        //sanity check
        console.log("Model output (string): ", response);
        console.log("Chat History: ", chatHistory);

        paragraphElement.classList.add("gemini-response")
        paragraphElement.innerHTML = `
            <div class="chat-body-inner right">
                <p>
                    ${response}
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

    clearInput();
    getChatResponse();

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

    //clear chat history
    chatHistory = [];
})