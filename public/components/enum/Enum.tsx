import Types from "@/public/components/objects";
import ObjectNode from "@/public/components/object/ObjectNode";
import Props from "@/public/components/enum/properties";

class Enumeration extends ObjectNode {
    constructor(props: Props) {
        super(props);
        this.setType = Types.ENUM;
    }
}
