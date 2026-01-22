import {forwardRef, type SVGProps} from "react";
import {tokenizeAndColorType} from "./type_color";
import {Text} from "Svg";

export type P = {
    name: string;
    type: string;
} & SVGProps<SVGTextElement>;

/**
 * A functional React component that renders an SVG text element with additional formatting.
 * The component is wrapped with `forwardRef` to pass down the `ref` to the underlying SVG element.
 * It utilizes the `Text` and `tspan` elements to display the provided `name` and `type` with optional color tokenization for the `type`.
 *
 * @param {Object} props - The props for the component.
 * @param {string} props.name - The text to display as the name in the SVG text element.
 * @param {string} props.type - The type information to display, which may be tokenized and colorized using `tokenizeAndColorType`.
 * @param {React.Ref<SVGTextElement>} ref - The forwarded ref to the SVG text element.
 * @returns {React.ReactElement} The rendered SVG text element with formatted content.
 */
const Parm = forwardRef<SVGTextElement, P>(function Parm({ name, type, ...props }, ref) {
    return (
        <Text
            ref={ref}
            {...props}
            x={Number(props.x) || 0}
            y={Number(props.y) || 0}
        >
            <tspan>{name}</tspan>
            {tokenizeAndColorType(`: ${type}`).map((token, tokenIndex) => (
                <tspan key={tokenIndex} fill={token.props.fill}>
                    {token.props.children}
                </tspan>
            ))}
        </Text>
    );
});

export default Parm;
