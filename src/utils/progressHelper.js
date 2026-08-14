export const calculateInternProgress = (intern) => {
    // 1. Destructure necessary fields. 
    // We assume 'intern' object contains: monthlyGoal, lessonsVisited, score (array of numbers)
    // If the server returns different structure (e.g. nested objects), we need to adapt.
    // Based on user prompt: "Server returns: goal, lessonsVisited, score"
    const { monthlyGoal, lessonsVisited, score = [] } = intern;

    // Safeguard against missing goal or 0 goal to avoid division by zero
    const safeGoal = monthlyGoal > 0 ? monthlyGoal : 1;
    const safeLessonsVisited = lessonsVisited || 0;

    // 1. Progress by lessons: (lessonsVisited / goal) * 100
    // limit to max 100
    let lessonsProgress = (safeLessonsVisited / safeGoal) * 100;
    lessonsProgress = Math.min(100, Math.max(0, lessonsProgress));

    // 2. Average Score
    // Logic: if 'score' is array, calculate average.
    // If 'averageScore' is provided (e.g. from server), use it.
    let averageScore = 0;

    if (Array.isArray(score) && score.length > 0) {
        const sum = score.reduce((acc, curr) => acc + curr, 0);
        averageScore = sum / score.length;
    } else if (typeof intern.averageScore === 'number') {
        averageScore = intern.averageScore;
    } else if (typeof score === 'number') {
        // If score stands for average score
        averageScore = score;
    }
    // Ensure we have a valid number, although logical above ensures it.

    // 3. Progress by Quality (Score)
    // scoreProgress = (averageScore / 5) * 100
    // limit to max 100
    let scoreProgress = (averageScore / 5) * 100;
    scoreProgress = Math.min(100, Math.max(0, scoreProgress));

    // 4. Overall Progress
    // Average of the two progresses
    let overallProgress = (lessonsProgress + scoreProgress) / 2;
    // Ensure integer or fixed decimal? User asked for percentage. Usually integer for UI.
    // User didn't specify rounding but "overallProgressPercentage" implies int usually, or 1 decimal.
    // The server logic used Math.round. Let's strictly follow formulas first, then format.

    // Status Color Logic
    // < 50 -> error
    // 50 <= x < 80 -> warning
    // >= 80 -> success

    const getStatusColor = (value) => {
        if (value < 50) return 'error'; // < 50
        if (value < 80) return 'warning'; // 50 <= x < 80
        return 'success'; // >= 80
    };

    const lessonsStatusColor = getStatusColor(lessonsProgress);
    const scoreStatusColor = getStatusColor(scoreProgress);
    const overallStatusColor = getStatusColor(overallProgress);

    return {
        // Return formatted values for UI
        monthlyGoal,
        actualLessons: safeLessonsVisited,
        averageScore, // can be float

        lessonsProgressPercentage: Math.round(lessonsProgress),
        lessonsStatusColor,

        scoreProgressPercentage: Math.round(scoreProgress),
        scoreStatusColor,

        overallProgressPercentage: Math.round(overallProgress),
        overallStatusColor
    };
};
