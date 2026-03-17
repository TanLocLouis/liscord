import { forwardRef, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	label?: string;
	hint?: string;
	error?: string;
	containerClassName?: string;
	labelClassName?: string;
	hintClassName?: string;
	errorClassName?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			id,
			name,
			label,
			hint,
			error,
			className,
			containerClassName,
			labelClassName,
			hintClassName,
			errorClassName,
			type = "text",
			...props
		},
		ref,
	) => {
		const inputId = id ?? name;

		return (
			<div className={`flex flex-col gap-1 w-full ${containerClassName}`}>
				{label && (
					<label htmlFor={inputId} className={labelClassName}>
						{label}
					</label>
				)}

				<input
					ref={ref}
					id={inputId}
					name={name}
					type={type}
					className={`w-full border-2 rounded-lg p-1 h-[45px] bg-[var(--color-secondary)] text-[var(--color-text-primary)] hover:shadow-[0_0_0_2px_color-mix(in_oklab,var(--color-primary)_20%,transparent)] focus:shadow-[0_0_0_2px_color-mix(in_oklab,var(--color-primary)_40%,transparent)] focus:outline-none transition-shadow duration-200 ${className} ${error ? "border-red-500" : ""}`}
					aria-invalid={Boolean(error)}
					{...props}
				/>

				{hint && !error && <p className={hintClassName}>{hint}</p>}
				{error && (
					<p role="alert" className={errorClassName}>
						{error}
					</p>
				)}
			</div>
		);
	},
);

Input.displayName = "Input";

export default Input;
