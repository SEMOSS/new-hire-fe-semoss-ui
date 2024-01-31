import { useEffect, useState, useReducer } from 'react';
import { observer } from 'mobx-react-lite';
import {
    Avatar,
    Collapse,
    List,
    Stack,
    Typography,
    Search,
    Button,
    Grid,
    styled,
    Divider,
} from '@semoss/ui';

import { usePixel, useRootStore } from '@/hooks';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
}));

const StyledFilter = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: 'fit-content',
    width: '352px',
    boxShadow: '0px 5px 22px 0px rgba(0, 0, 0, 0.06)',
    background: theme.palette.background.paper,
}));

const StyledFilterList = styled(List)(({ theme }) => ({
    width: '100%',
    borderRadius: theme.shape.borderRadius,
    gap: theme.spacing(2),
}));

const StyledChipList = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    marginLeft: theme.spacing(2),
    gap: theme.spacing(2),
}));

const StyledFilterSearchContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
}));

const StyledAvatarCount = styled(Avatar)(({ theme }) => ({
    width: theme.spacing(4),
    height: theme.spacing(4),
    fontSize: theme.spacing(1.75),
    fontWeight: 500,
    color: theme.palette.text.primary,
    background: theme.palette.secondary.main,
}));

const StyledShowMore = styled(Typography)(({ theme }) => {
    // TODO: Fix typing
    // const palette = theme.palette as CustomPaletteOptions;
    const palette = theme.palette as unknown as {
        primary: Record<string, string>;
        primaryContrast: Record<string, string>;
    };

    return {
        color: palette.primary.main,
        '&:hover': {
            color: palette.primaryContrast['900'],
            cursor: 'pointer',
        },
    };
});

export interface FilterboxProps {
    /** Determined to get metakeys for Engines/App */
    type: 'APP' | 'MODEL' | 'FUNCTION' | 'VECTOR' | 'STORAGE' | 'DATABASE';
    /** Filters to hold in state at parent */
    onChange: (filters: unknown) => void;
}

const initialState = {
    favoritedDbs: [],
    databases: [],
    filterSearch: '',
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'field': {
            return {
                ...state,
                [action.field]: action.value,
            };
        }
    }
    return state;
};

export const Filterbox = (props: FilterboxProps) => {
    const { type, onChange } = props;
    const { configStore } = useRootStore();

    const [state, dispatch] = useReducer(reducer, initialState);
    const { filterSearch } = state;

    const tagColors = [
        'blue',
        'orange',
        'teal',
        'purple',
        'yellow',
        'pink',
        'violet',
        'olive',
    ];

    const list =
        type === 'APP'
            ? configStore.store.config.projectMetaKeys
            : configStore.store.config.databaseMetaKeys;

    // get a list of the keys
    const metaKeyList = list.filter((k) => {
        return (
            k.display_options === 'single-checklist' ||
            k.display_options === 'multi-checklist' ||
            k.display_options === 'single-select' ||
            k.display_options === 'multi-select' ||
            k.display_options === 'single-typeahead' ||
            k.display_options === 'multi-typeahead'
        );
    });

    // get metakeys to the ones we want
    const metaKeys = metaKeyList.map((k) => {
        return k.metakey;
    });

    // track the options
    const [filterOptions, setFilterOptions] = useState<
        Record<string, { value: string; count: number }[]>
    >({});

    // track which filters are opened their selected value, and search term
    const [filterVisibility, setFilterVisibility] = useState<
        Record<string, { open: boolean; value: string[]; search: string }>
    >(() => {
        return metaKeyList.reduce((prev, current) => {
            prev[current.metakey] = {
                open: false,
                value: [],
                search: '',
            };

            return prev;
        }, {});
    });
    const [filterByVisibility, setFilterByVisibility] = useState(true);

    const getCatalogFilters = usePixel<
        {
            METAKEY: string;
            METAVALUE: string;
            count: number;
        }[]
    >(
        metaKeys.length > 0
            ? type === 'APP'
                ? `GetProjectMetaValues(metaKeys=${JSON.stringify(metaKeys)}) ;`
                : `GetEngineMetaValues( engineTypes=[${type}]} metaKeys = ${JSON.stringify(
                      metaKeys,
                  )} ) ;`
            : '',
    );

    /**
     * @desc Catalog filters
     */
    useEffect(() => {
        if (getCatalogFilters.status !== 'SUCCESS') {
            return;
        }

        // format the catalog data into a map
        const updated = getCatalogFilters.data.reduce((prev, current) => {
            if (!prev[current.METAKEY]) {
                prev[current.METAKEY] = [];
            }

            prev[current.METAKEY].push({
                value: current.METAVALUE,
                count: current.count,
                color: setFieldOptionColor(current.METAVALUE),
            });
            return prev;
        }, {});

        setFilterOptions(updated);
    }, [getCatalogFilters.status, getCatalogFilters.data]);

    /**
     *
     * @param opt - option for the field color
     * @returns color
     */
    const setFieldOptionColor = (opt: string): string => {
        return tagColors[
            opt
                .split('')
                .map((x) => x.charCodeAt(0))
                .reduce((a, b) => a + b) % 8
        ];
    };

    /**
     * @name setSelectedFilters
     * @desc sets filter value for each filter (tag, domain, etc.)
     */
    const setSelectedFilters = (
        filterLabel: string,
        filter: { value: string; count: number },
    ) => {
        // first find specific filter
        const newValue = filterVisibility[filterLabel].value;
        const index = newValue.indexOf(filter.value);

        if (index === -1) {
            newValue.push(filter.value);
        } else {
            newValue.splice(index, 1);
        }

        // Now update filter object to have new selected values
        setFilterVisibility({ ...filterVisibility });

        const constructedFilters = {};

        Object.entries(filterVisibility).forEach((obj) => {
            if (obj[1].value.length) {
                constructedFilters[obj[0]] = obj[1].value;
            }
        });
        // Pass filters to parent
        onChange(constructedFilters);
    };

    /**
     * @name formatName
     * @param str
     * @returns format string
     */
    const formatName = (str: string) => {
        let i;
        const frags = str.split('_');
        for (i = 0; i < frags.length; i++) {
            frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
        }
        return frags.join(' ');
    };

    return (
        <StyledFilter>
            <StyledFilterList dense={true}>
                <List.Item
                    secondaryAction={
                        <List.ItemButton
                            onClick={() => {
                                setFilterByVisibility(!filterByVisibility);
                            }}
                        >
                            {filterByVisibility ? (
                                <ExpandLess />
                            ) : (
                                <ExpandMore />
                            )}
                        </List.ItemButton>
                    }
                >
                    <List.ItemText
                        disableTypography
                        primary={
                            <Typography variant="h6">Filter By</Typography>
                        }
                    />
                </List.Item>

                <Collapse in={filterByVisibility}>
                    {Object.entries(filterOptions).length ? (
                        <StyledFilterSearchContainer>
                            <Search
                                size={'small'}
                                placeholder={'Search by...'}
                                value={filterSearch}
                                onChange={(e) => {
                                    dispatch({
                                        type: 'field',
                                        field: 'filterSearch',
                                        value: e.target.value,
                                    });
                                }}
                                sx={{ width: '100%' }}
                            />
                        </StyledFilterSearchContainer>
                    ) : null}

                    {Object.entries(filterOptions).map((entries, i) => {
                        const totalFilters =
                            Object.entries(filterOptions).length;
                        const list = entries[1];
                        let shownListItems = 0; // for show more functionality
                        return (
                            <div key={i}>
                                <List.Item>
                                    <List.ItemText
                                        disableTypography
                                        primary={
                                            <Typography variant={'h6'}>
                                                {formatName(entries[0])}
                                            </Typography>
                                        }
                                    />
                                </List.Item>
                                {/* <StyledNestedFilterList dense={true}> */}
                                {list.map((filterOption, i) => {
                                    if (
                                        shownListItems > 4 &&
                                        !filterVisibility[entries[0]].open
                                    ) {
                                        return;
                                    } else {
                                        if (
                                            filterOption.value
                                                .toLowerCase()
                                                .includes(
                                                    filterSearch.toLowerCase(),
                                                )
                                        ) {
                                            shownListItems += 1;
                                            return (
                                                <List.Item
                                                    disableGutters
                                                    key={i}
                                                >
                                                    <List.ItemButton
                                                        disableGutters
                                                        sx={{
                                                            paddingLeft: '16px',
                                                            paddingRight:
                                                                '16px',
                                                        }}
                                                        selected={
                                                            filterVisibility[
                                                                entries[0]
                                                            ].value.indexOf(
                                                                filterOption.value,
                                                            ) > -1
                                                        }
                                                        onClick={() => {
                                                            // Reset databases and reset offset
                                                            dispatch({
                                                                type: 'field',
                                                                field: 'databases',
                                                                value: [],
                                                            });
                                                            // setOffset(
                                                            //     0,
                                                            // );

                                                            setSelectedFilters(
                                                                entries[0],
                                                                filterOption,
                                                            );
                                                        }}
                                                        aria-label={
                                                            filterVisibility[
                                                                entries[0]
                                                            ].value.indexOf(
                                                                filterOption.value,
                                                            ) > -1
                                                                ? `Unfilter ${filterOption.value}`
                                                                : `Filter ${filterOption.value}`
                                                        }
                                                    >
                                                        <div
                                                            style={{
                                                                width: '100%',
                                                                display: 'flex',
                                                                justifyContent:
                                                                    'space-between',
                                                            }}
                                                        >
                                                            <List.ItemText
                                                                disableTypography
                                                                primary={
                                                                    <Typography variant="body1">
                                                                        {
                                                                            filterOption.value
                                                                        }
                                                                    </Typography>
                                                                }
                                                            />
                                                            <StyledAvatarCount
                                                                variant={
                                                                    'rounded'
                                                                }
                                                            >
                                                                {
                                                                    filterOption.count
                                                                }
                                                            </StyledAvatarCount>
                                                        </div>
                                                    </List.ItemButton>
                                                </List.Item>
                                            );
                                        }
                                    }
                                })}
                                {shownListItems > 4 && (
                                    <List.Item>
                                        <div
                                            onClick={() => {
                                                const visibleFilters = {
                                                    ...filterVisibility,
                                                };
                                                visibleFilters[entries[0]] = {
                                                    open: !visibleFilters[
                                                        entries[0]
                                                    ].open,
                                                    value: visibleFilters[
                                                        entries[0]
                                                    ].value,
                                                    search: visibleFilters[
                                                        entries[0]
                                                    ].search,
                                                };
                                                setFilterVisibility(
                                                    visibleFilters,
                                                );
                                            }}
                                        >
                                            <StyledShowMore variant={'body1'}>
                                                Show{' '}
                                                {filterVisibility[entries[0]]
                                                    .open
                                                    ? 'Less'
                                                    : 'More'}
                                            </StyledShowMore>
                                        </div>
                                    </List.Item>
                                )}
                                {/* </StyledNestedFilterList> */}
                                {i + 1 !== totalFilters && (
                                    <div
                                        style={{
                                            width: '100%',
                                        }}
                                    >
                                        <Divider></Divider>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </Collapse>
            </StyledFilterList>
        </StyledFilter>
    );
};