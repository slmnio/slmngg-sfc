<template>
    <div class="match-filters">
        {{ calculatedMatches?.length }} matches
        <div class="filters d-flex gap-3 my-2">
            <div v-for="filter in filterGroups" :key="filter.key" class="filter">
                <div class="fw-bold p-1 filter-title">
                    <div class="text">{{ filter.text }}</div>
                    <b-form-checkbox
                        v-model="filterAll[filter.key]"
                        :indeterminate="indeterminate[filter.key]"
                        @click="!filterAll[filter.key] ? fillSelection(filter.key) : emptySelection(filter.key)">
                        All
                    </b-form-checkbox>
                </div>
                <div class="filter-options bg-dark rounded p-1">
                    <b-form-checkbox-group v-model="filterSelections[filter?.key]" stacked>
                        <b-form-checkbox v-for="option in filter.options" :key="option.option" :value="option.option">
                            {{ option.display || option.option }} ({{ option.count }})
                        </b-form-checkbox>
                    </b-form-checkbox-group>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { sortAlpha } from "@/utils/sorts";

export default {
    name: "MatchFilters",
    props: ["matches", "keys", "filteredMatches", "types"],
    emits: ["update:filteredMatches"],
    data: () => ({
        filterSelections: {},
        filterAll: {},
    }),
    computed: {
        filterTypes() {
            return this.types || [
                {
                    key: "division",
                    text: "Division",
                    display: "distinct"
                },
                {
                    key: "sub_event",
                    text: "Sub Event",
                    display: "distinct"
                },
                {
                    key: "week_text",
                    text: "Week",
                    display: "distinct"
                }
            ];
        },
        activeFilters() {
            return Object.fromEntries(Object.entries(this.filterSelections).map(([filterKey, options]) => {
                return [filterKey, Object.entries(options).filter(([opt, bool]) => bool).map(([opt, bool]) => opt)];
            }));
        },
        filterGroups() {
            return this.filterTypes.map(type => {
                const values = {};

                for (const match of this.matches) {
                    const value = match?.[type?.key];
                    if (value === undefined) continue;
                    if (!values[value]) values[value] = 0;
                    values[value]++;
                }
                return {
                    ...type,
                    options: Object.entries(values).map(([option, count]) => {
                        if (type.key === "first_to" && type.text === "Best of") {
                            return {
                                option, count,
                                display: (option * 2)-1
                            };
                        }
                        if (type.displayMap?.[option]) {
                            return {
                                option, count,
                                display: type.displayMap?.[option]
                            };
                        }
                        return { option, count };
                    }).sort((a,b) => {
                        const diff = b.count - a.count;
                        if (diff) return diff;
                        return sortAlpha(a, b, "option");
                    })
                };
            }).filter(filter => (filter.options || [])?.length > 1);
        },
        calculatedMatches() {
            return (this.matches || []).filter(m => {
                return Object.entries(this.filterSelections).every(([key, options]) => {
                    if (!options?.length) return true;
                    const filterGroup = this.filterGroups.find(f => f.key === key);
                    let data = m?.[key];

                    if (filterGroup.parseInt) {
                        data = parseInt(data);
                        return options.map(x => parseInt(x, 10)).includes(data);
                    }

                    return options.includes(data);
                });
            });
        },
        indeterminate() {
            return Object.fromEntries(this.filterGroups.map((filter) =>
                [
                    filter.key,
                    this.filterSelections[filter.key].length !== 0 &&
                    this.filterSelections[filter.key].length !== filter.options.length
                ]
            ));
        }
    },
    methods: {
        setAll(filterKey, val) {
            this.filterGroups.find(f => f.key === filterKey).options.forEach(option => {
                this.filterSelections[filterKey][option.option] = val;
            });
        },
        fillSelection(filterKey) {
            this.filterSelections[filterKey] = ((this.filterGroups.find(f => f.key === filterKey) || {})?.options || []).map(opt => {
                return opt.option;
            });
        },
        emptySelection(filterKey) {
            this.filterSelections[filterKey] = [];
        }
    },
    watch: {
        filterGroups: {
            immediate: true,
            deep: true,
            handler(filters) {
                (filters || []).forEach(filter => {
                    if (!this.filterSelections[filter.key]) {
                        this.filterSelections[filter.key] = [];
                    }
                });
            }
        },
        filterSelections: {
            immediate: true,
            deep: true,
            handler(selections) {
                console.log(selections);
                Object.entries(selections).forEach(([filterKey, values]) => {
                    if (!filterKey) return;
                    const filter = this.filterGroups.find(f => f.key === filterKey);
                    if (!filter) return;

                    if (values.length === 0) this.filterAll[filter.key] = false;
                    if (values.length === filter.options.length && filter.options.length > 0) this.filterAll[filter.key] = true;
                });
            }
        },
        calculatedMatches: {
            deep: true,
            immediate: true,
            handler(matches, oldMatches) {
                if (JSON.stringify(matches) === JSON.stringify(oldMatches)) return;
                console.log(matches, oldMatches);
                console.log("update:filteredMatches", matches);
                this.$emit("update:filteredMatches", matches);
            }
        }
        // filterAll: {
        //     immediate: true,
        //     deep: true,
        //     handler(filters, oldFilters) {
        //         console.log(filters, oldFilters);
        //         console.log(...arguments);
        //         for (const [filterKey, val] of Object.entries((filters))) {
        //             console.log({ filterKey, val }, oldFilters?.[filterKey], filters?.[filterKey]);
        //             if (val !== oldFilters?.[filterKey]) {
        //                 // handle
        //
        //                 if (val) {
        //                     this.filterGroups.find(f => f.key === filterKey).options.forEach(option => {
        //                         this.filterSelections[filterKey][option.option] = true;
        //                     });
        //                 } else if (val === false) {
        //                     this.filterGroups.find(f => f.key === filterKey).options.forEach(option => {
        //                         this.filterSelections[filterKey][option.option] = false;
        //                     });
        //                 }
        //             }
        //         }
        //     }
        // }
    },
    beforeMount() {
        (this.filterGroups || []).forEach(filter => {
            if (!this.filterSelections[filter.key]) {
                this.filterSelections[filter.key] = [];
            }
        });
    }
};
</script>

<style scoped>
    .filter:deep(.form-check-label) {
        user-select: none;
    }
    .filter-options {
        max-height: 10em;
        overflow-y: scroll
    }


    .filter-options::-webkit-scrollbar-track {
        border-radius: 4px;
        background-color: transparent;
    }

    .filter-options::-webkit-scrollbar {
        width: 6px;
        height: 6px;
        background-color: transparent;
    }

    .filter-options::-webkit-scrollbar-thumb {
        border-radius: 4px;
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.5);
        background-color: #222;
        transition: background-color 300ms ease;
    }

    .filter:hover::-webkit-scrollbar-thumb,
    .filter:active::-webkit-scrollbar-thumb {
        background-color: #333;
    }
</style>
