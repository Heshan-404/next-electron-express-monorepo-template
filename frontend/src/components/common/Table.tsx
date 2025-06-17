import React, { useState, useRef, useEffect, useCallback } from 'react';
import tableStyles from '../../styles/table.module.css'; // Assuming your CSS file is here

export interface Column<T> {
    header: string;
    key: keyof T | string;
    render?: (item: T) => React.ReactNode;
    initialWidth?: number; // Optional initial width for the column
    minWidth?: number;    // Optional minimum width
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyField: keyof T;
    caption?: string;
}

const Table = <T extends object>({ data, columns, keyField, caption }: TableProps<T>) => {
    // State to store current column widths
    // Keys are column identifiers (col.key), values are widths in pixels
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
        // Initialize with provided initialWidth or a default (e.g., 100px)
        // You might want to calculate initial widths dynamically based on content or distribution
        return columns.reduce((acc, col) => {
            acc[String(col.key)] = col.initialWidth || 100; // Default to 100px if no initialWidth
            return acc;
        }, {} as Record<string, number>);
    });

    // Refs to store state during a drag operation without triggering re-renders
    const resizingColumnKey = useRef<string | null>(null);
    const startX = useRef(0);
    const startWidth = useRef(0);

    // Callback for when a resize handle is pressed down
    const handleMouseDown = useCallback((e: React.MouseEvent, columnKey: string) => {
        resizingColumnKey.current = columnKey;
        startX.current = e.clientX;
        startWidth.current = columnWidths[columnKey];

        // Add global event listeners to document.body to handle dragging outside the table header
        document.body.addEventListener('mousemove', handleMouseMove);
        document.body.addEventListener('mouseup', handleMouseUp);

        // Prevent text selection during drag for better UX
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
    }, [columnWidths]); // Depend on columnWidths to get the latest width

    // Callback for when the mouse moves during a drag
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (resizingColumnKey.current === null) return; // Not dragging

        const deltaX = e.clientX - startX.current;
        let newWidth = startWidth.current + deltaX;

        // Apply minimum width if specified for the column
        const column = columns.find(col => String(col.key) === resizingColumnKey.current);
        const minWidth = column?.minWidth || 50; // Default min width
        if (newWidth < minWidth) {
            newWidth = minWidth;
        }

        // Update the column's width in state
        setColumnWidths(prevWidths => ({
            ...prevWidths,
            [resizingColumnKey.current!]: newWidth,
        }));
    }, [columns]); // Depend on columns to get minWidth

    // Callback for when the mouse button is released after a drag
    const handleMouseUp = useCallback(() => {
        resizingColumnKey.current = null; // End dragging

        // Remove global event listeners
        document.body.removeEventListener('mousemove', handleMouseMove);
        document.body.removeEventListener('mouseup', handleMouseUp);

        // Restore user select and cursor
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
    }, []);

    // Cleanup effect: ensures event listeners are removed when component unmounts
    useEffect(() => {
        return () => {
            document.body.removeEventListener('mousemove', handleMouseMove);
            document.body.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    if (!data || data.length === 0) {
        return <p>No data available.</p>;
    }

    return (
        <table className={tableStyles.customTable}>
            {caption && <caption>{caption}</caption>}
            <thead>
            <tr>
                {columns.map((col, index) => {
                    const columnKey = String(col.key);
                    const width = columnWidths[columnKey];
                    const isLastColumn = index === columns.length - 1;

                    return (
                        <th
                            key={columnKey}
                            style={{ width: width, minWidth: col.minWidth || 50 }} // Apply width and minWidth
                        >
                            {col.header}
                            {/* Add resize handle to all columns except possibly the last one */}
                            {!isLastColumn && ( // You might choose to not resize the last column or resize it differently
                                <div
                                    className={tableStyles.resizeHandle}
                                    onMouseDown={(e) => handleMouseDown(e, columnKey)}
                                />
                            )}
                        </th>
                    );
                })}
            </tr>
            </thead>
            <tbody>
            {data.map((item, index) => (
                <tr key={String(item[keyField]) || index}>
                    {columns.map((col) => (
                        <td key={`${String(item[keyField])}-${String(col.key)}`}>
                            {/* Render cell content */}
                            {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default Table;