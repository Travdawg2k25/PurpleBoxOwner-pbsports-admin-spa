import { useEffect } from "react";
import { imageUrl } from "../../helper/helper";

export default function Modal({
    open,
    close,
    modalPosition,
    modalHeading,
    modalBody,
    crossModal,
    modalHeader,
    contentClass, modalClass, headingClass, headerClass
}) {

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
            }
        };

        // Add event listener to detect "Enter" key press
        document.addEventListener("keydown", handleKeyDown);

        // Clean up on unmount
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div
            // onClick={close}
            className={`app-modal fixed inset-0 bg-gray-900 bg-opacity-50 flex transform transition-all duration-300 z-20  
                ${modalClass ? modalClass : ""}
                ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                ${modalPosition === "center" ? "justify-center items-center" : ""}
                ${modalPosition === "left" ? "justify-start" : ""}
                ${modalPosition === "right" ? "justify-end" : ""}`}
        >
            {/* Modal Content */}
            <div
                className={`bg-white overflow-auto p-6 pt-0 transform transition-transform duration-300 ease-in-out min-w-[500px] 
                    ${modalPosition === "right" ? (open ? "translate-x-0 !scale-100" : "translate-x-full !scale-100") : ""}
                    ${modalPosition === "center" && open ? "scale-100 rounded-[10px]" : "scale-95"}
                    ${contentClass ? contentClass : ""}`}
                onClick={(e) => e.stopPropagation()} // Prevent the close handler from being triggered
            >
                {modalHeader && (
                    <div className={`app-modal-header pt-6 z-50 flex justify-between items-center sticky bg-white top-0 ${headerClass ? headerClass : ""}`}>
                        <h1 className={`text-base font_B ${headingClass}`} >{modalHeading}</h1>
                        {crossModal && (
                            <button
                                className="border-0 border-solid border-gray p-2 rounded-full"
                                onClick={close}
                            >
                                <img
                                    src={imageUrl + "humburgerClose.png"}
                                    alt=""
                                    width={"12px"}
                                />
                            </button>
                        )}
                    </div>
                )}
                <div className="app-modal-body mt-12">{modalBody}</div>
            </div>
        </div>
    );
}
