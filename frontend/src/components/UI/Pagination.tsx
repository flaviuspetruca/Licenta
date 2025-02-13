import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

const ITEMS_PER_PAGE = 6;

const Pagination = ({ children }: { children: JSX.Element[] }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(children.length / ITEMS_PER_PAGE);

    const handleChangePage = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
    };

    const currentItems = children.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <>
            <div className="flex flex-wrap justify-center items-center content-start gap-5 w-full">{currentItems}</div>
            <div className="flex items-center rounded-3xl justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 w-full">
                {/* Mobile Pagination */}
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => handleChangePage(currentPage - 1)}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        disabled={currentPage === 1}
                        aria-label="Previous Page"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => handleChangePage(currentPage + 1)}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        disabled={currentPage === totalPages}
                        aria-label="Next Page"
                    >
                        Next
                    </button>
                </div>
                {/* Desktop Pagination */}
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                            <span className="font-medium">
                                {Math.min(currentPage * ITEMS_PER_PAGE, children.length)}
                            </span>{" "}
                            of <span className="font-medium">{children.length}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={() => handleChangePage(currentPage - 1)}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                disabled={currentPage === 1}
                                aria-label="Previous Page"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handleChangePage(page)}
                                    aria-current={currentPage === page ? "page" : undefined}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                        currentPage === page
                                            ? "bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => handleChangePage(currentPage + 1)}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                disabled={currentPage === totalPages}
                                aria-label="Next Page"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Pagination;
