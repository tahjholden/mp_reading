/**
 * Reading level utilities
 * Converts between Lexile scores, grade levels, and displays reading level information
 */

/**
 * Convert Lexile score to approximate grade level
 */
export function lexileToGradeLevel(lexile: number): number {
	if (lexile < 450) return 4;
	if (lexile < 650) return 5;
	if (lexile < 850) return 6;
	return 6; // Cap at 6th grade for this app
}

/**
 * Get grade level range from Lexile range
 */
export function lexileRangeToGradeRange(
	minLexile: number,
	maxLexile: number
): { min: number; max: number } {
	return {
		min: lexileToGradeLevel(minLexile),
		max: lexileToGradeLevel(maxLexile)
	};
}

/**
 * Format reading level for display
 */
export function formatReadingLevel(
	lexileScore?: number | null,
	gradeLevelMin?: number | null,
	gradeLevelMax?: number | null
): string {
	if (lexileScore) {
		const grade = lexileToGradeLevel(lexileScore);
		return `Lexile ${lexileScore} (Grade ${grade})`;
	}

	if (gradeLevelMin && gradeLevelMax) {
		if (gradeLevelMin === gradeLevelMax) {
			return `Grade ${gradeLevelMin}`;
		}
		return `Grades ${gradeLevelMin}-${gradeLevelMax}`;
	}

	if (gradeLevelMin) {
		return `Grade ${gradeLevelMin}+`;
	}

	return 'Reading level not specified';
}

/**
 * Calculate estimated reading time in minutes
 * Assumes average reading speed of 200 words per minute for 4th-6th graders
 */
export function calculateReadingTime(wordCount?: number | null): number | null {
	if (!wordCount) return null;
	const wordsPerMinute = 200;
	return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Check if a book's reading level matches a student's reading level
 */
export function matchesReadingLevel(
	bookMinLexile: number | null,
	bookMaxLexile: number | null,
	studentLexile: number | null
): boolean {
	if (!studentLexile || !bookMinLexile || !bookMaxLexile) return true; // Default to showing if level unknown

	return studentLexile >= bookMinLexile && studentLexile <= bookMaxLexile;
}



