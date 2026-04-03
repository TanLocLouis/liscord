import { useNavigate } from "react-router";
import { motion } from "motion/react";
import Button from "@components/Button/Button";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <motion.div
      initial={{ transform: "translateY(2%)", opacity: 0 }}
      animate={{ transform: "translateY(0)", opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="flex-1 min-w-0 h-[calc(100vh-80px)] m-2 rounded-[18px] border border-[color:color-mix(in_oklab,var(--color-text-primary)_22%,transparent)] shadow-[0_16px_38px_color-mix(in_oklab,var(--color-text-primary)_18%,transparent)] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_10%_-10%,color-mix(in_oklab,var(--color-primary)_20%,transparent),transparent_45%),radial-gradient(circle_at_90%_0%,color-mix(in_oklab,var(--color-info)_16%,transparent),transparent_38%),color-mix(in_oklab,var(--color-secondary)_86%,var(--color-primary-soft)_14%)] max-md:mx-2 max-md:my-[0.4rem] max-md:rounded-[14px]"
    >
      <div className="text-center px-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6"
        >
          <h1 className="text-9xl font-bold text-[var(--color-primary)] mb-2">
            404
          </h1>
          <p className="text-3xl font-semibold text-[var(--color-text-secondary)] mb-4">
            Page Not Found
          </p>
          <p className="text-lg text-[var(--color-text-secondary)] opacity-75 mb-8">
            Sorry, the page you're looking for doesn't exist.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <Button
            onClick={handleGoHome}
            className="h-[45px] px-8"
            title="Go to Home"
          >
            Go Home
          </Button>
          <Button
            onClick={handleGoBack}
            className="h-[45px] px-8"
            title="Go Back"
          >
            Go Back
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotFound;
