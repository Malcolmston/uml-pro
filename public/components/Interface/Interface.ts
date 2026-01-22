import ObjectNode from "@/public/components/object/ObjectNode";
import Props from "@/public/components/Interface/properties";
import Types from "@/public/components/objects";

export default class Interface extends ObjectNode {
    constructor(props: Props) {
        super(props);
        this.setType = Types.INTERFACE;
    }
}
