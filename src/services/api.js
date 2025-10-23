/**
 * Centralized API Service
 * All API endpoints and calls are managed here
 */

// API Configuration
const API_CONFIG = {
  MACRO_CALCULATOR: {
    BASE_URL: "https://fitness-calculator.p.rapidapi.com",
    ENDPOINT: "/macrocalculator",
    HEADERS: {
      "x-rapidapi-key": "cadc5825cfmsh9a25f241a72c04cp1615e4jsna438eb0b1727", // Replace with your RapidAPI key
      "x-rapidapi-host": "fitness-calculator.p.rapidapi.com",
    },
  },
};

/**
 * Calculate macro goals based on user profile
 * @param {Object} userProfile - User profile data
 * @param {number} userProfile.age - User age
 * @param {string} userProfile.gender - User gender (male/female)
 * @param {number} userProfile.height - User height in cm
 * @param {number} userProfile.weight - User weight in kg
 * @param {string} userProfile.activityLevel - Activity level (sedentary/light/moderate/active/veryactive)
 * @param {string} userProfile.goal - Fitness goal (maintain/mild weight loss/weight loss/extreme weight loss)
 * @returns {Promise<Object>} Calculated macro goals
 */
export const calculateMacroGoals = (userProfile) => {
  try {
    const { age, gender, height, weight, activityLevel, goal } = userProfile;

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryactive: 1.9,
    };

    // Macro split percentages
    const macroSplit = {
      carbs: 0.5,
      protein: 0.2,
      fat: 0.3,
    };

    // 1️⃣ Calculate BMR
    let bmr;
    if (gender.toLowerCase() === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // 2️⃣ Calculate TDEE
    const tdee = bmr * activityMultipliers[activityLevel.toLowerCase()];

    // 3️⃣ Adjust calories based on goal
    let targetCalories = tdee;
    switch (goal.toLowerCase()) {
      case "mild weight loss":
        targetCalories -= 250;
        break;
      case "weight loss":
        targetCalories -= 500;
        break;
      case "extreme weight loss":
        targetCalories -= 1000;
        break;
      case "maintain":
      default:
        break;
    }

    // 4️⃣ Calculate macros in grams
    const carbsGoal = (targetCalories * macroSplit.carbs) / 4;
    const proteinGoal = (targetCalories * macroSplit.protein) / 4;
    const fatsGoal = (targetCalories * macroSplit.fat) / 9;

    return {
      calorieGoal: Math.round(targetCalories),
      proteinGoal: Math.round(proteinGoal),
      carbsGoal: Math.round(carbsGoal),
      fatsGoal: Math.round(fatsGoal),
    };
  } catch (error) {
    console.error("Error calculating macro goals:", error);
    throw error;
  }
};

/**
 * Get all available activity levels
 */
export const getActivityLevels = () => {
  return [
    { label: "Sedentary (little to no exercise)", value: "sedentary" },
    { label: "Light (1-3 days/week)", value: "light" },
    { label: "Moderate (3-5 days/week)", value: "moderate" },
    { label: "Active (6-7 days/week)", value: "active" },
    { label: "Very Active (intense daily exercise)", value: "veryactive" },
  ];
};

/**
 * Get all available fitness goals
 */
export const getFitnessGoals = () => {
  return [
    { label: "Maintain Weight", value: "maintain" },
    { label: "Mild Weight Loss", value: "mild weight loss" },
    { label: "Weight Loss", value: "weight loss" },
    { label: "Extreme Weight Loss", value: "extreme weight loss" },
  ];
};
