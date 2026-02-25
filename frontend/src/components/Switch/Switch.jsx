import { useMemo, useState } from 'react';

/**
 * Reusable Switch component
 * - Controlled via `checked` + `onChange`
 * - Or uncontrolled via `defaultChecked`
 * - Accessible: role="switch", aria-checked, keyboard/touch/mouse
 * - Sizes: sm | md | lg
 */
const Switch = ({
	checked,
	defaultChecked = false,
	onChange,
	disabled = false,
	size = 'md', // 'sm' | 'md' | 'lg'
	id,
	label, // optional text shown to the right
	className,
	activeColor = 'var(--main-color, #22c55e)',
	inactiveColor = '#e5e7eb',
	knobColor = '#ffffff',
	ariaLabel, // when no visible label is provided
}) => {
	const isControlled = typeof checked === 'boolean';
	const [internal, setInternal] = useState(defaultChecked);
	const isOn = isControlled ? checked : internal;

	const autoId = useMemo(
		() => id || `switch-${Math.random().toString(36).slice(2, 9)}`,
		[id]
	);

	const sizes = {
		sm: { trackW: 36, trackH: 20, knob: 16, pad: 2 },
		md: { trackW: 44, trackH: 24, knob: 20, pad: 2 },
		lg: { trackW: 56, trackH: 32, knob: 28, pad: 2 },
	};
	const s = sizes[size] || sizes.md;
	const translateX = isOn ? s.trackW - s.knob - s.pad * 2 : 0;

	function toggle(next, event) {
		if (disabled) return;
		if (!isControlled) setInternal(next);
		if (onChange) onChange(next, event);
	}

	function handleClick(e) {
		toggle(!isOn, e);
	}

	function handleKeyDown(e) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggle(!isOn, e);
		}
	}

	const trackStyle = {
		width: s.trackW,
		height: s.trackH,
		borderRadius: 9999,
		background: isOn ? activeColor : inactiveColor,
		position: 'relative',
		transition: 'background 120ms ease',
		outline: 'none',
		border: '1px solid var(--color-primary)',
		cursor: disabled ? 'not-allowed' : 'pointer',
		opacity: disabled ? 0.6 : 1,
		padding: s.pad,
		boxSizing: 'border-box',
		display: 'inline-flex',
		alignItems: 'center',
	};

	const knobStyle = {
		position: 'absolute',
		top: s.pad - 1, // -1 to account for border
		left: s.pad,
		width: s.knob,
		height: s.knob,
		borderRadius: 9999,
		background: knobColor,
		boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
		transform: `translateX(${translateX}px)`,
		transition: 'transform 140ms ease',
		willChange: 'transform',
	};

	return (
		<label
			htmlFor={autoId}
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 8,
				userSelect: 'none',
			}}
			className={className}
		>
			<button
				id={autoId}
				type="button"
				role="switch"
				aria-checked={isOn}
				aria-disabled={disabled}
				aria-label={label ? undefined : ariaLabel || 'Toggle'}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				style={trackStyle}
				disabled={disabled}
			>
				<span aria-hidden="true" style={knobStyle} />
			</button>
			{label ? (
				<span style={{ fontSize: 14 }}>{label}</span>
			) : null}
		</label>
	);
}

export default Switch;