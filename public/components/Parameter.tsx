import {forwardRef, type SVGProps} from "react";
import { Text } from "./Svg";
import Visibility from "./visibility";
import {tokenizeAndColorType} from "./type_color";

export type ParmProps = {
    visibility?: Visibility;
    name: string;
    type: string;
    isStatic?: boolean;
    isFinal?: boolean;
} & SVGProps<SVGTextElement>;


/**
 * A React functional component that renders a text representation of a parameter,
 * supporting customizable styling and visibility options.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Visibility} [props.visibility=Visibility.PRIVATE] - The visibility level of the parameter. Defaults to `PRIVATE`.
 * @param {string} props.name - The name of the parameter.
 * @param {string} props.type - The data type of the parameter, displayed with tokenized and colored formatting.
 * @param {boolean} [props.isStatic=false] - Indicates whether the parameter is static. When `true`, the text is underlined.
 * @param {boolean} [props.isFinal=false] - Indicates whether the parameter is final. When `true`, the name is converted to uppercase and underscores replace spaces.
 * @param {SVGTextElement} [ref] - A ref forwarded to the rendered `Text` component for direct DOM manipulation.
 * @param {...Object} props - Additional properties spread to the underlying `Text` component (e.g., `x` and `y`).
 *
 * @returns {JSX.Element} A styled `Text` component with formatted parameter details.
 */
const Parameter = forwardRef<SVGTextElement, ParmProps>(function Parameter(
    {
        visibility = Visibility.PRIVATE,
        name,
        type,
        isStatic = false,
        isFinal = false,
        ...props
    },
    ref
) {
    const displayName = isFinal
        ? name.toUpperCase().replace(/\s+/g, "_")
        : name;

    return (
        <Text
            ref={ref}
            {...props}
            x={Number(props.x) || 0}
            y={Number(props.y) || 0}
            textDecoration={isStatic ? "underline" : "none"}

        >
            <tspan>{visibility} {displayName}</tspan>
            {tokenizeAndColorType(`: ${type}`).map((token, tokenIndex) => (
                <tspan key={tokenIndex} fill={token.props.fill}>
                    {token.props.children}
                </tspan>
            ))}
        </Text>
    );
});

export default Parameter;
