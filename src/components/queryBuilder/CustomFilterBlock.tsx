import {Combobox, ComboboxOption, IconButton, Input, Stack} from "@grafana/ui";
import {CustomFilter, CustomFilterType, Operand, QueryBuilderOptions} from "../../types/queryBuilder";
import React from "react";

type CustomFilterProps = {
  changeFunction: (customFilters: CustomFilter[]) => void
  filterKey: number
  builderOptions: QueryBuilderOptions
  filter: CustomFilter
}

export const CustomFilterBlock = (props: CustomFilterProps) => {
    const { changeFunction, filter, filterKey, builderOptions} = props;
    const {type, operand, value} = filter;
    const types: ComboboxOption[] | ((inputValue: string) => Promise<ComboboxOption[]>) | { label: any; value: any; }[]  = (Object.values(CustomFilterType) as Array< CustomFilterType >).map(v => {return {key: v, value: v}})
    const operands: ComboboxOption[] | ((inputValue: string) => Promise<ComboboxOption[]>) | { label: any; value: any; }[]  = (Object.values(Operand) as Array< Operand >).map(v => {return {key: v, value: v}})
    return (
            <Stack direction='row' wrap='nowrap' alignItems='center' justifyContent='start' gap={1}>
                <Combobox
                    options={types}
                    value={type && type.length > 0 ? type : ""}
                    onChange={e => {
                        const newFilters = [...builderOptions.customFilters]; // copy the array
                        newFilters[filterKey] = {
                            type: e?.value! as CustomFilterType,
                            operand,
                            value,
                        };
                        changeFunction(newFilters); // pass new array
                    }}
                    width={17}
                    isClearable={false}
                    createCustomValue={true}
                />
            <Combobox
                options={operands}
                value={operand && operand.length > 0 ? operand : ""}
                onChange={e => {
                    const newFilters = [...builderOptions.customFilters]; // copy the array
                    newFilters[filterKey] = {
                        type,
                        operand: e?.value! as Operand,
                        value,
                    };
                    changeFunction(newFilters); // pass new array
                }}
                width={10}
                isClearable={false}
                createCustomValue={false}
            />

            <Input
                value={value && value.length > 0 ? value : ""}
                onChange={e => {
                    const newFilters = [...builderOptions.customFilters]; // copy the array
                    newFilters[filterKey] = {
                        type,
                        operand,
                        value: e.currentTarget.value,
                    };
                    changeFunction(newFilters); // pass new array
                }}
                width={25}
            />
            <IconButton
                name="times"
                size="lg"
                variant="destructive"
                aria-label="Remove"
                onClick={() => {
                    const newFilters = builderOptions.customFilters.filter((_, i) => i !== filterKey);
                    changeFunction(newFilters);
                }}
            />
            </Stack>
    );
}