import React, { useState } from "react";

const Tooltip = ({
    children,
    content,
    position = "top",
    delay = 0,
    customClass = "",
}) => {
    const [showTooltip, setShowTooltip] = useState(false);
    let timeout;

    // Positions for tooltip and arrow
    const tooltipPositions = {
        top: "bottom-full left-1/2 transform -translate-x-[86%] mb-3",
        right: "left-full top-1/2 transform -translate-y-[70%] ml-3",
        bottom: "top-full left-1/2 transform -translate-x-[86%] mt-3",
        left: "right-full top-1/2 transform -translate-y-[70%] mr-3",
    };

    const arrowPositions = {
        top: "top-full left-[62%] transform rotate-45 mt-2 border-t-white",
        right: "right-full top-1/2 transform -translate-y-1/2 -mr-1 border-r-white",
        bottom: "top-[-3%] right-[10%] transform rotate-45  border-b-white",
        left: "left-full top-1/2 transform -translate-y-1/2 -ml-1 border-l-white",
    };

    // Show/hide delay for tooltip
    const handleMouseEnter = () => {
        timeout = setTimeout(() => {
            setShowTooltip(true);
        }, delay);
    };

    const handleMouseLeave = () => {
        clearTimeout(timeout);
        setShowTooltip(false);
    };

    return (
        <div
            className="relative flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {showTooltip && (
                <div
                    className={`absolute  rounded-[5px] z-20  ${tooltipPositions[position]} ${customClass}`}
                >
                    {/* Tooltip content */}
                    <div className="z-10 relative py-3 px-4 text-sm text-[#353D44] bg-white rounded-[5px] whitespace-nowrap  shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] min-w-[100px]">
                        {content}
                    </div>

                    {/* Arrow */}
                    <div
                        className={`absolute w-0 h-0 border-[7px] border-white shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] ${arrowPositions[position]}`}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default Tooltip;
