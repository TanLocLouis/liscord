import { motion } from "framer-motion";

type WelcomeProps = {
	serverName?: string;
	username?: string;
};

const Welcome = ({ serverName = "Liscord", username = "there" }: WelcomeProps) => {
	return (
		<section className="relative h-full w-full overflow-hidden rounded-2xl border border-[var(--color-text-primary)]/15 p-6 text-[var(--color-gray-100)] shadow-[0_20px_45px_rgba(15,23,42,0.35)] sm:p-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_5%_5%,rgba(133,132,212,0.432)_10%,transparent_30%),radial-gradient(circle_at_90%_80%,rgba(62,77,103,0.428)_10%,transparent_30%)]">
            </div> 
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45, ease: "easeOut" }}
				className="relative z-10 mx-auto flex h-full max-w-3xl flex-col justify-between"
			>
				<div className="space-y-6">
					<motion.span
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35, delay: 0.1 }}
						className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-100"
					>
						Ready To Chat
					</motion.span>

					<motion.div
						initial={{ opacity: 0, y: 14 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.15 }}
						className="space-y-3"
					>
						<h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
							Welcome back, {username}.
						</h1>
						<p className="max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
							You are in <span className="font-semibold text-orange-200">{serverName}</span>. Select a channel on the left to jump into live conversations, share updates, and react with emojis in real time.
						</p>
					</motion.div>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 18 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45, delay: 0.22 }}
					className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-3"
				>
					<div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
						<p className="text-xs uppercase tracking-[0.15em] text-sky-100">Step 1</p>
						<p className="mt-2 text-sm font-medium text-white">Choose a Channel</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
						<p className="text-xs uppercase tracking-[0.15em] text-orange-100">Step 2</p>
						<p className="mt-2 text-sm font-medium text-white">Start the Conversation</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
						<p className="text-xs uppercase tracking-[0.15em] text-emerald-100">Step 3</p>
						<p className="mt-2 text-sm font-medium text-white">Invite Friends</p>
					</div>
				</motion.div>
			</motion.div>
		</section>
	);
};

export default Welcome;
