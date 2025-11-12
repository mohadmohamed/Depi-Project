import React, { useMemo, useCallback } from 'react';
import './questionCard.css';

export default function QuestionCard({
	index,
	question,
	options,
	selectedLetter,
	onSelect,
	disabled = false
}) {
	const optionItems = useMemo(() => {
		if (!options) {
			return [];
		}

		if (Array.isArray(options)) {
			return options
				.map((text, optionIndex) => ({
					letter: String.fromCharCode(65 + optionIndex),
					text: text ?? ''
				}))
				.filter(option => option.text.trim().length > 0);
		}

		return Object.entries(options)
			.map(([letter, text]) => ({
				letter: (letter || '').toString().trim().toUpperCase(),
				text: (text || '').toString()
			}))
			.filter(option => option.letter && option.text.trim().length > 0)
			.sort((a, b) => a.letter.localeCompare(b.letter));
	}, [options]);

	const handleChoice = useCallback((letter) => {
		if (disabled || typeof onSelect !== 'function') {
			return;
		}
		onSelect(letter.toUpperCase());
	}, [disabled, onSelect]);

	const buildChoiceClass = useCallback((letter) => {
		const isSelected = selectedLetter?.toUpperCase() === letter;
		const classes = ['choice-item'];

		if (disabled) {
			classes.push('choice-submitted');
		} else {
			classes.push('choice-interactive');
		}

		if (isSelected) {
			classes.push('choice-selected');
		}

		return classes.join(' ');
	}, [disabled, selectedLetter]);

	const handleKeyDown = useCallback((event, letter) => {
		if (disabled) {
			return;
		}

		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleChoice(letter);
		}
	}, [disabled, handleChoice]);

	return (
		<div className="q-card">
			<h2 className="q-header">
				Question {index + 1}: {question}
			</h2>

			<div className="choices-container" role="radiogroup" aria-label={`Question ${index + 1}`}>
				{optionItems.length > 0 ? optionItems.map(({ letter, text }) => {
					const isSelected = selectedLetter?.toUpperCase() === letter;

					return (
						<div
							key={letter}
							className={buildChoiceClass(letter)}
							role="radio"
							aria-checked={isSelected}
							tabIndex={disabled ? -1 : 0}
							onClick={() => handleChoice(letter)}
							onKeyDown={(event) => handleKeyDown(event, letter)}
						>
							<div className="choice-letter">{letter}</div>
							<div className="choice-text">{text}</div>
						</div>
					);
				}) : (
					<div className="no-options">
						<p>No answer choices available for this question.</p>
					</div>
				)}
			</div>
		</div>
	);
}
