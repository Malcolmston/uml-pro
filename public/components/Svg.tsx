import type {ReactNode, SVGProps} from "react";

/**
 * Interface representing the properties of a rectangle.
 *
 * @interface RectProps
 * @property {number} width - The width of the rectangle.
 * @property {number} height - The height of the rectangle.
 * @property {number} x - The x-coordinate of the top-left corner of the rectangle.
 * @property {number} y - The y-coordinate of the top-left corner of the rectangle.
 * @property {number} [rx] - The x-axis radius for rounded corners. Optional.
 * @property {number} [ry] - The y-axis radius for rounded corners. Optional.
 */
interface RectProps {
    width: number;
    height: number;
    x: number;
    y: number;
    rx?: number;
    ry?: number;
}

/**
 * Represents the properties of a line in a 2D coordinate system.
 *
 * @interface LineProps
 *
 * @property {number} x1 - The x-coordinate of the starting point of the line.
 * @property {number} y1 - The y-coordinate of the starting point of the line.
 * @property {number} x2 - The x-coordinate of the ending point of the line.
 * @property {number} y2 - The y-coordinate of the ending point of the line.
 */
interface LineProps {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

/**
 * Represents the properties of a circle in a 2D coordinate system.
 *
 * @interface CircleProps
 *
 * @property {number} r - The radius of the circle.
 * @property {number} cx - The x-coordinate of the circle's center.
 * @property {number} cy - The y-coordinate of the circle's center.
 */
interface CircleProps {
    r: number;
    cx: number;
    cy: number;
}

/**
 * Represents the properties used to define text elements within a React-based rendering context.
 *
 * @interface TextProps
 * @property {number} x - The x-coordinate for positioning the text.
 * @property {number} y - The y-coordinate for positioning the text.
 * @property {string} [text] - Optional string content to display as text.
 * @property {ReactNode} [children] - Optional children nodes for rendering nested elements.
 */
interface TextProps {
    x: number;
    y: number;
    text?: string;
    children?: ReactNode;
}

/**
 * Represents properties for a polygon shape.
 *
 * @interface PolygonProps
 * @property {string} points - A string representing the coordinates of the polygon's vertices.
 */
interface PolygonProps {
    points: string;
}

/**
 * Represents properties related to a path element in SVG.
 *
 * This interface is primarily used to define the shape and structure
 * of an SVG path through the 'd' attribute, which specifies the path's
 * data as a string.
 *
 * Properties:
 * - d: A string representing the path data for a vector graphic. The data
 *   defines the shape to be drawn and follows the SVG path syntax.
 */
interface PathProps {
    d: string;
}

/**
 * Represents the properties of an ellipse shape.
 *
 * @interface EllipseProps
 * @property {number} rx - The horizontal radius of the ellipse.
 * @property {number} ry - The vertical radius of the ellipse.
 * @property {number} cx - The x-coordinate of the center of the ellipse.
 * @property {number} cy - The y-coordinate of the center of the ellipse.
 */
interface EllipseProps {
    rx: number;
    ry: number;
    cx: number;
    cy: number;
}

/**
 * Functional component that renders an SVG rectangle (`<rect>` element).
 *
 * @param {Object} props - The properties passed to the component.
 * @param {number | string | undefined} props.width - The width of the rectangle.
 * @param {number | string | undefined} props.height - The height of the rectangle.
 * @param {number | string | undefined} props.x - The x-coordinate of the rectangle's top-left corner.
 * @param {number | string | undefined} props.y - The y-coordinate of the rectangle's top-left corner.
 * @param {number | string | undefined} props.rx - The x-axis radius of the rectangle's rounded corners.
 * @param {number | string | undefined} props.ry - The y-axis radius of the rectangle's rounded corners.
 * @param {Object} props.props - Additional properties to be directly passed to the `<rect>` element.
 * @returns {React.Element} The rendered `<rect>` element with the specified properties.
 */
export const Rect = ({
                         width,
                         height,
                         x,
                         y,
                         rx,
                         ry,
                         ...props
                     }: RectProps & SVGProps<SVGRectElement>) => {
    return (
        <rect
            width={width}
            height={height}
            x={x}
            y={y}
            rx={rx}
            ry={ry}
            {...props}
        />
    );
};

/**
 * Represents an SVG line element.
 *
 * This functional component takes properties for the start and end points of a line
 * and additional SVG attributes, rendering an SVG `<line>` element based on them.
 *
 * @param {object} params - The parameters for the line element.
 * @param {number | string | undefined} params.x1 - The x-coordinate of the start point of the line.
 * @param {number | string | undefined} params.y1 - The y-coordinate of the start point of the line.
 * @param {number | string | undefined} params.x2 - The x-coordinate of the end point of the line.
 * @param {number | string | undefined} params.y2 - The y-coordinate of the end point of the line.
 * @param {LineProps & SVGProps<SVGLineElement>} props - Additional properties and attributes to apply to the `<line>` element.
 * @returns {JSX.Element} The rendered SVG `<line>` element with the specified properties.
 */
export const Line = ({
                         x1,
                         x2,
                         y1,
                         y2,
                         ...props
                     }: LineProps & SVGProps<SVGLineElement>) => {
    return (
        <line x1={x1} y1={y1} x2={x2} y2={y2} {...props} />
    );
};

/**
 * A functional component that renders an SVG circle element.
 *
 * @param {CircleProps & SVGProps<SVGCircleElement>} props - The properties for the circle SVG element.
 * @param {number} props.r - The radius of the circle.
 * @param {number} props.cx - The x-coordinate of the circle's center.
 * @param {number} props.cy - The y-coordinate of the circle's center.
 * @param {object} [props.props] - Additional properties to be passed to the SVG circle element.
 * @returns {JSX.Element} An SVG circle element with the specified properties.
 */
export const Circle = ({
                           r,
                           cx,
                           cy,
                           ...props
                       }: CircleProps & SVGProps<SVGCircleElement>) => {
    return (
        <circle r={r} cx={cx} cy={cy} {...props} />
    );
};

/**
 * Functional component that renders an SVG `<text>` element.
 *
 * @param {Object} props - Properties passed to the component.
 * @param {number | string | undefined} props.x - The x-coordinate for the text position.
 * @param {number | string | undefined} props.y - The y-coordinate for the text position.
 * @param {string | undefined} props.text - The main text content to be rendered.
 *                                           If not provided, the `children` prop will be used.
 * @param {React.ReactNode} props.children - Alternative content to render inside the text element
 *                                           if the `text` prop is not provided.
 * @param {Object} [props.props] - Additional properties passed to the SVG `<text>` element.
 *
 * @returns {JSX.Element} An SVG `<text>` element with the provided properties and content.
 */
export const Text = ({
                         x,
                         y,
                         text,
                         children,
                         ...props
                     }: TextProps & SVGProps<SVGTextElement>) => {
    return (
        <text x={x} y={y} {...props}>{text ?? children}</text>
    );
};

/**
 * A functional component that renders an SVG polygon element.
 *
 * @typedef PolygonProps
 * @property {string} points - A string defining the points of the polygon.
 *
 * @component
 * @param {PolygonProps & SVGProps<SVGPolygonElement>} props - The properties passed to the Polygon component.
 * @returns {JSX.Element} The SVG polygon element rendered with the specified points and properties.
 */
export const Polygon = ({
                            points,
                            ...props
                        }: PolygonProps & SVGProps<SVGPolygonElement>) => {
    return (
        <polygon points={points} {...props} />
    );
};

/**
 * A functional component that renders an SVG path element.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.d - The "d" attribute for the path element, defining the path data.
 * @param {Object} [props.rest] - Additional properties to be spread onto the path element.
 *
 * @returns {JSX.Element} An SVG path element.
 */
export const Path = ({
                         d,
                         ...props
                     }: PathProps & SVGProps<SVGPathElement>) => {
    return (
        <path d={d} {...props} />
    );
};

/**
 * A functional component representing an SVG ellipse element.
 *
 * @param {number} rx - The x-axis radius of the ellipse.
 * @param {number} ry - The y-axis radius of the ellipse.
 * @param {number} cx - The x-axis center coordinate of the ellipse.
 * @param {number} cy - The y-axis center coordinate of the ellipse.
 * @param {object} props - Additional SVG properties passed to the ellipse element.
 * @returns {JSX.Element} The rendered ellipse SVG element.
 */
export const Ellipse = ({
                            rx,
                            ry,
                            cx,
                            cy,
                            ...props
                        }: EllipseProps & SVGProps<SVGEllipseElement>) => {
    return (
        <ellipse rx={rx} ry={ry} cx={cx} cy={cy} {...props} />
    );
};


