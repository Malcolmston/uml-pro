/**
 * Renders a background grid pattern for a given view box.
 * This component creates two overlaid grid patterns (`grid` and `grid-major`), designed
 * to extend beyond the specified view box dimensions for consistent rendering of the background.
 *
 * @param {Object} props - The properties object.
 * @param {Object} props.viewBox - Defines the dimensions and position of the view box.
 * @param {number} props.viewBox.x - The x-coordinate of the view box origin.
 * @param {number} props.viewBox.y - The y-coordinate of the view box origin.
 * @param {number} props.viewBox.width - The width of the view box.
 * @param {number} props.viewBox.height - The height of the view box.
 */
const Background = ({viewBox}: {viewBox: {x: number, y: number, width: number, height: number} }) => (
    <>
        <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
            <pattern id="grid-major" width="200" height="200" patternUnits="userSpaceOnUse">
                <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
            </pattern>
        </defs>

        <rect x={viewBox.x - 1000} y={viewBox.y - 1000} width={viewBox.width + 2000} height={viewBox.height + 2000}
              fill="url(#grid)" style={{pointerEvents: 'none'}}/>
        <rect x={viewBox.x - 1000} y={viewBox.y - 1000} width={viewBox.width + 2000} height={viewBox.height + 2000}
              fill="url(#grid-major)" style={{pointerEvents: 'none'}}/>
    </>
);

export default Background;
