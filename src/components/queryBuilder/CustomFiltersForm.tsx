import {styles} from "../../styles";
import {CustomFilterBlock} from "./CustomFilterBlock";
import {Grid, Button} from "@grafana/ui";
import React from "react";
import {CustomFilter, QueryBuilderOptions} from "../../types/queryBuilder";

type CustomFilterFormProps = {
    changeFunction: (customFilters: CustomFilter[]) => void
    builderOptions: QueryBuilderOptions
}


export const CustomFilterForm = (props: CustomFilterFormProps) => {
    const {changeFunction, builderOptions} = props;
    return (
        <>
            <div className={'gf-form ' + styles.QueryEditor.queryType}>
                <Button
                    icon="plus"
                    size="sm"
                    variant="secondary"
                    aria-label="Add"
                    tooltip="The data can be filtered by resourceName or tags (the tags have to be specified manually following the format tag|TagName for example tag|AlarmingLevel). The result will be Union (AND) of all conditions."
                    onClick={() => {
                        changeFunction([
                            ...builderOptions.customFilters,
                            {type: null, operand: null, value: null}
                        ]);
                    }}
                >Add Condition</Button>
            </div>
            <div className={'gf-form ' + styles.QueryEditor.queryType}>
                <Grid columns={1}>
                    {builderOptions.customFilters.map((filter, key) => (
                        <CustomFilterBlock
                            changeFunction={changeFunction}
                            filterKey={key}
                            filter={filter}
                            builderOptions={builderOptions}/>
                    ))}
                </Grid>
            </div>
        </>
    )
}