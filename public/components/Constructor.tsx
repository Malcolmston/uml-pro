import React, {forwardRef, type SVGProps} from "react";
import {Text} from "./Svg";

import Visibility from "./visibility";
import {tokenizeAndColorType} from "./type_color";
import {type P} from "./Parm";

export type ConstructorProps = {
    vis?: Visibility;
    name: string;
    params?: P[];
    isStatic?: boolean;
    isAbstract?: boolean;
} & SVGProps<SVGTextElement>;

/**
 * A React functional component that renders a representation of a TypeScript/JavaScript
 * constructor syntax inside an SVG element with styling dependent on its properties.
 *
 * @param {Object} props - The properties used to configure the Constructor component.
 * @param {Visibility} [props.vis=Visibility.PUBLIC] - The visibility level of the constructor (e.g., public, private, protected).
 * @param {string} props.name - The name of the constructor as it appears in the declaration.
 * @param {Array<{name: string, type: string}>} [props.params=[]] - A list of parameter objects, each containing a `name` and `type` for the parameter.
 * @param {boolean} [props.isStatic=false] - Determines whether the constructor is marked as static. If true, the constructor's font style will be italicized.
 * @param {boolean} [props.isAbstract=false] - Determines whether the constructor is marked as abstract. If true, the constructor's font weight will be bold.
 * @param {Object} props.props - Additional SVG properties passed to the `Text` component for rendering.
 * @param {React.Ref<SVGTextElement>} ref - A React ref forwarded to the underlying SVG `Text` element.
 * @returns {JSX.Element} An SVG representation of the constructor with its visibility, parameter list, and styles applied.
 */
const Constructor = forwardRef<SVGTextElement, ConstructorProps>(function Constructor(
    {
        vis = Visibility.PUBLIC,
        name,
        params = [],
        isStatic = false,
        isAbstract = false,
        ...props
    },
    ref
) {
    tokenizeAndColorType(`: string`);
    return (
        <Text
            ref={ref}
            {...props}
            x={Number(props.x) || 0}
            y={Number(props.y) || 0}
            fontStyle={isStatic ? "italic" : "normal"}
            fontWeight={isAbstract ? "bold" : "normal"}
        >
            <tspan>{vis} {name}(</tspan>
            {params.map((param, i) => (
                <React.Fragment key={i}>
                    {i > 0 && <tspan>, </tspan>}
                    <tspan>{param.name}</tspan>
                    {tokenizeAndColorType(`: ${param.type}`).map((token, tokenIndex) => (
                        <tspan key={`${i}-${tokenIndex}`} fill={token.props.fill}>
                            {token.props.children}
                        </tspan>
                    ))}
                </React.Fragment>
            ))}
            <tspan>)</tspan>
        </Text>
    );
});

export default Constructor;
