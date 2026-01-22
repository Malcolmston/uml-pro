import Interface from "@/public/components/Interface/Interface";
import {AnnotationElement} from "@/public/components/annotation/properties";
import Props from "@/public/components/abstract/properties";
import {MethodProps} from "@/public/components/Method";
import Visibility from "@/public/components/visibility";

export default class Annotation extends Interface {
    // Store elements for annotation-specific handling
    elements: AnnotationElement[];

    constructor(props: Props) {
        // @ts-expect-error: Interface constructor does not accept 'type', but required for annotation
        super({...props, type: Types.ANNOTATION});

        // Convert elements to methods for the parent Interface class
        this.elements = props.elements || [];

        // Convert annotation elements to methods if elements are provided
        if (props.elements && props.elements.length > 0) {
            const elementMethods: MethodProps[] = props.elements.map(element => ({
                name: element.name,
                returnType: element.type,
                defaultValue: element.defaultValue,
                visibility: Visibility.PUBLIC,
                isAbstract: true,
                params: [] // Annotation elements have no parameters
            }));

            // Merge with any existing methods
            this.methods = [...(props.methods || []), ...elementMethods];
        }
    }
}
