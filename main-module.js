import {GoogleGenerativeAI} from "@google/generative-ai";
//create a config.js file and export the API key from there
/* config.js example
    const gemini-api = "API HERE";
    export {gemini-api};
*/
import {gemini_api} from "./config.js"; 

const API_KEY = gemini_api;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash" /*"learnlm-1.5-pro-experimental"*/,
    systemInstruction: 'You are named Jared',
});

const chatHistory = [];


export {model, chatHistory};