const LoadingSpinner = ({
  size = 200,
  color = "var(--main-color)",
}) => {
  return (
    <>
        <img 
            src="./vite.png"
            alt="Loading..."
            style={{
                width: size,
                height: size,
                animation: "spin 2s linear infinite",
                color: color,
            }}
        >
        </img>
    </>
  );
}

export default LoadingSpinner;
