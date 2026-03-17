const Button = ({width = "100%",
                height = "50px",
                margin = "0",
                title = "Button",
                color = "var(--color-text-primary)",
                backgroundColor = "var(--color-primary)",
                ...props}) => {
    return (
        <button style={{width,
                        height,
                        margin,
                        color,
                        backgroundColor,
                        }}
                {...props}
                className="border rounded-lg border-[var(--color-primary)] font-bold hover:shadow-[0_2px_10px_var(--color-primary)] transition-shadow duration-200"
        >
                {title}
        </button>
    )
}

export default Button;