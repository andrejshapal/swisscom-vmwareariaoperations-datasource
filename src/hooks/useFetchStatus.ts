import {STATUSES} from "../queryparser/constants";
import {DataSource} from "../datasource";

export default (datasource: DataSource): readonly string[] => {
    return STATUSES;
};
