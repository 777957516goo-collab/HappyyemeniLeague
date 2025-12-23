
import { GoogleGenAI, Type } from "@google/genai";
import { Player } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateScoutingReport = async (player: Player): Promise<string> => {
  try {
    const prompt = `
      أنت محلل كروي محترف. قم بكتابة تقرير كشافة (Scouting Report) قصير ومحفز باللغة العربية للاعب التالي في الدوري اليمني بتشنغدو:
      الاسم: ${player.name}
      المركز: ${player.position}
      التقييم العام: ${player.overall}
      الإحصائيات:
      - السرعة: ${player.stats.pace}
      - التسديد: ${player.stats.shooting}
      - التمرير: ${player.stats.passing}
      - المراوغة: ${player.stats.dribbling}
      - الدفاع: ${player.stats.defending}
      - القوة البدنية: ${player.stats.physical}

      اجعل التقرير حماسياً ويركز على نقاط قوته بناءً على الأرقام. لا يتجاوز 30 كلمة.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "لاعب موهوب يمتلك إمكانيات كبيرة ستفيد فريقه في البطولة.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "تحليل اللاعب جاهز للميدان.";
  }
};
