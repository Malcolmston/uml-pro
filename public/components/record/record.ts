import ObjectNode from "@/public/components/object/ObjectNode";
import Props from "@/public/components/record/properties";
import Types from "@/public/components/objects";

export default class Record extends ObjectNode {
    private originalName: string;

    constructor(props: Props) {
        super(props);

        this.setType = Types.RECORD;

        // Store the original class name
        this.originalName = this.props.name;

        // Create the record signature for display
        const paramSignature = this.params.map(param => `${param.name}: ${param.type}`).join(', ');
        this.name = `${this.originalName}(${paramSignature})`;
    }


}
