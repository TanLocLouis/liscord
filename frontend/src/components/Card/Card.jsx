import { useState } from "react";
import { useNavigate } from "react-router";
import "./Card.css";

const Card = ( { bin, onDelete }) => {
    const [expanded, setExpanded] = useState(false);

    const {
        _id,
        bin_id,
        text,
        password,
        expireTime,
        isShorternURL,
        createdAt,
        closeBinAt
    } = bin;

    const handleExpandClicked = () => {
        setExpanded((prev) => !prev);
    }

    const redirect = useNavigate();
    const handleBinClicked = (binId) => {
        redirect(`/${binId}`);
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className={`card-header-expand${expanded ? " expanded" : ""}`}>
                    <svg onClick={handleExpandClicked}  xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" fill="var(--color-primary)" viewBox="0 0 448 512"><path d="M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184z"/></svg> 
                </div>

                <div className="card-header-content">
                    <p onClick={() => handleBinClicked(bin_id)} className={`card-text${expanded ? " expanded" : ""}`}>{text}</p>
                    {expanded && (
                        <div className="card-details">
                            <p><strong>Bin ID:</strong> {bin_id}</p>
                            <p><strong>Password Protected:</strong> {password ? "Yes" : "No"}</p>
                            <p><strong>Expires In:</strong> {expireTime ? `${expireTime} seconds` : "Never"}</p>
                            <p><strong>Shortened URL:</strong> {isShorternURL ? "Yes" : "No"}</p>
                            <p><strong>Created At:</strong> {new Date(createdAt).toLocaleString()}</p>
                            <p><strong>Closed At:</strong> {new Date(closeBinAt).toLocaleString()}</p>
                        </div>
                    )}
                </div>

                <div className="card-header-expand">
                    <svg onClick={() => onDelete(bin_id)} xmlns="http://www.w3.org/2000/svg" width="1.5em" fill="var(--color-primary)" viewBox="0 0 640 640"><path d="M262.2 48C248.9 48 236.9 56.3 232.2 68.8L216 112L120 112C106.7 112 96 122.7 96 136C96 149.3 106.7 160 120 160L520 160C533.3 160 544 149.3 544 136C544 122.7 533.3 112 520 112L424 112L407.8 68.8C403.1 56.3 391.2 48 377.8 48L262.2 48zM128 208L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 208L464 208L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 208L128 208zM288 280C288 266.7 277.3 256 264 256C250.7 256 240 266.7 240 280L240 456C240 469.3 250.7 480 264 480C277.3 480 288 469.3 288 456L288 280zM400 280C400 266.7 389.3 256 376 256C362.7 256 352 266.7 352 280L352 456C352 469.3 362.7 480 376 480C389.3 480 400 469.3 400 456L400 280z"/></svg>
                </div>
            </div>
        </div> 
    )
}

export default Card;