import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config({ path: "./config/.env" });

const groq = new Groq({ apiKey: process.env.API_KEY });

export default groq;