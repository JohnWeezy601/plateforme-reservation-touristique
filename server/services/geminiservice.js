const { GoogleGenAI } = require("@google/genai");

// =====================================================
// CONFIGURATION GEMINI
// =====================================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// =====================================================
// DEMANDER UNE REPONSE A GEMINI
// =====================================================

async function demanderGemini(message) {

    try {

        const response = await ai.models.generateContent({

            model: "gemini-3.5-flash-lite",

            contents: message

        });

        return response.text;

    } catch (error) {

        console.error("ERREUR GEMINI :", error);

        throw error;

    }

}

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    demanderGemini
};