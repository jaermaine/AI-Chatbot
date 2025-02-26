import {model} from './main-module.js';

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
        const result = await model.generateContent(userText);

        //sanity check
        console.log("Model output: ", result);

        const response = await result.response.text();

        //sanity check
        console.log("Model output (string): ", response);

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
})