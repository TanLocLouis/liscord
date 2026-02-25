import { useEffect, useRef } from "react";

const AutoResizeTextarea = ({
  value,
  onChange,
  minHeight = 100,
  maxHeight = 300,
  ...props
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    // Reset first to get correct scrollHeight
    ref.current.style.height = "auto";

    const scrollHeight = ref.current.scrollHeight;

    if (scrollHeight > maxHeight) {
      ref.current.style.height = maxHeight + "px";
      ref.current.style.overflowY = "auto"; // enable scrolling
    } else {
      ref.current.style.height = scrollHeight + "px";
      ref.current.style.overflowY = "hidden"; // no scrollbar
    }
  }, [value, maxHeight]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      rows={1}
      style={{
        minHeight,
        maxHeight,
        borderRadius: "8px",
        padding: "1em",
        resize: "none",
        width: "100%",
        borderColor: "var(--color-primary)",
      }}
      {...props}
    />
  );
}

export default AutoResizeTextarea;