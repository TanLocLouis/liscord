import "./Footer.css";

function Footer() {
    const curYear = new Date().getFullYear();

    return (
        <div className="footer">
            <div style={{"display": "flex", "justifyContent": "center", "alignItems": "center"}}>
            <label>© 2025 - {curYear} TanLocLouis | All Rights Reserved</label>
            </div>
        </div>
    )
}

export default Footer;