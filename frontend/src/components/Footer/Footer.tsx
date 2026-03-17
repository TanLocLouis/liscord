function Footer() {
    const curYear = new Date().getFullYear();

    return (
        <div className="flex align-center justify-center footer w-full h-10 fixed bottom-0 bg-[var(--color-secondary)]">
            <div style={{"display": "flex", "justifyContent": "center", "alignItems": "center"}}>
            <label className="text-[var(--color-text-secondary)]">© 2025 - {curYear} TanLocLouis | All Rights Reserved</label>
            </div>
        </div>
    )
}

export default Footer;