import {GoogleGenerativeAI} from "@google/generative-ai";
import {gemini_api} from "./config.js";

const API_KEY = gemini_api;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash" /*"learnlm-1.5-pro-experimental"*/,
    //systemInstruction: 'INSERT AN INSTRUCTION HERE',
});


export {model};