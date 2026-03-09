import Button from "@components/Button/Button.jsx";
import "./Pagination.css";

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    // Caculate total pages
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Callback function when page changes
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    return (
        <div className="pagination">
            <Button 
                    width="100px" 
                    title="Previous"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}>
            </Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button 
                width="100px" 
                title="Next"
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}>
            </Button>
        </div>
    )
}

export default Pagination;