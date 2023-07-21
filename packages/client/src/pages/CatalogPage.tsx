import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
    Collapse,
    styled,
    Stack,
    Typography,
    Search,
    Button,
    ToggleButton,
    ToggleButtonGroup,
    Grid,
    List,
} from '@semoss/ui';
import {
    DataObjectOutlined,
    ExpandLess,
    ExpandMore,
    FormatListBulletedOutlined,
    Inventory2Outlined,
    MenuBookOutlined,
    People,
    SpaceDashboardOutlined,
} from '@mui/icons-material';

import { useNavigate, useLocation } from 'react-router-dom';

import defaultDBImage from '@/assets/img/placeholder.png';
import { DatabaseLandscapeCard, DatabaseTileCard } from '@/components/database';
import { usePixel, useRootStore } from '@/hooks';
import { Page } from '@/components/ui';

const StyledStack = styled(Stack)(({ theme }) => ({
    // paddingTop: theme.spacing(1)
}));

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    height: '100%',
    gap: theme.spacing(3),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
}));

const StyledFitler = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '355px',
    gap: theme.spacing(2),
}));

const StyledFilterList = styled(List)(({ theme }) => ({
    width: '100%',
    background: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
}));

const StyledNestedFilterList = styled(List)(({ theme }) => ({
    width: '100%',
    // marginLeft: theme.spacing(2),
    // marginRight: theme.spacing(2),
}));

const StyledContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    flex: '1',
}));
/**
 * Catalog landing Page
 * Landing page to view the available datasets and search through it
 */
export const CatalogPage = observer((): JSX.Element => {
    const { configStore } = useRootStore();
    const navigate = useNavigate();
    const { search: catalogParams } = useLocation();

    /** This page is shared by db, storage, model */
    let catalogType = '';

    switch (catalogParams) {
        case '':
            catalogType = 'database';
            break;
        case '?type=database':
            catalogType = 'database';
            break;
        case '?type=model':
            catalogType = 'model';
            break;
        case '?type=storage':
            catalogType = 'storage';
            break;
    }

    // get a list of the keys
    const databaseMetaKeys = configStore.store.config.databaseMetaKeys.filter(
        (k) => {
            return (
                k.display_options === 'single-checklist' ||
                k.display_options === 'multi-checklist' ||
                k.display_options === 'single-select' ||
                k.display_options === 'multi-select' ||
                k.display_options === 'single-typeahead' ||
                k.display_options === 'multi-typeahead'
            );
        },
    );

    // get metakeys to the ones we want
    const metaKeys = databaseMetaKeys.map((k) => {
        return k.metakey;
    });

    // save the search string
    const [search, setSearch] = useState<string>('');

    // which view we are on
    const [mode, setMode] = useState<string>('My Databases');
    const [view, setView] = useState<'list' | 'tile'>('tile');

    const dbPixelPrefix: string =
        mode === 'My Databases' ? `MyEngines` : 'MyDiscoverableEngines';

    // track the options
    const [filterOptions, setFilterOptions] = useState<
        Record<string, { value: string; count: number; selected: boolean }[]>
    >({});

    // track which filters are opened / closed
    const [filterVisibility, setFilterVisibility] = useState<
        Record<string, boolean>
    >(() => {
        return databaseMetaKeys.reduce((prev, current) => {
            prev[current.metakey] = false;

            return prev;
        }, {});
    });

    // track the filter values
    const [filterValues, setFilterValues] = useState<
        Record<string, string[] | string | null>
    >(() => {
        return databaseMetaKeys.reduce((prev, current) => {
            const multiple =
                current.display_options === 'multi-checklist' ||
                current.display_options === 'multi-select' ||
                current.display_options === 'multi-typeahead';

            prev[current.metakey] = multiple ? [] : null;

            return prev;
        }, {});
    });

    // const buttons = ['My Databases', 'Community Databases'];
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

    const metaFilters = {};
    for (const key in filterValues) {
        const filter = filterValues[key];
        if (filter && filter.length > 0) {
            metaFilters[key] = filter;
        }
    }

    const getDatabases = usePixel<
        {
            app_cost: string;
            app_id: string;
            app_name: string;
            app_type: string;
            database_cost: string;
            database_global: boolean;
            database_id: string;
            database_name: string;
            database_type: string;
            description: string;
            low_database_name: string;
            permission: number;
            tag: string;
            user_permission: number;
            upvotes: number;
        }[]
    >(
        `${dbPixelPrefix}( metaKeys = ${JSON.stringify(
            metaKeys,
        )} , metaFilters = [ ${JSON.stringify(
            metaFilters,
        )} ] , filterWord=["${search}"], userT = [true]) ;`,
    );

    const getCatalogFilters = usePixel<
        {
            METAKEY: string;
            METAVALUE: string;
            count: number;
        }[]
    >(
        metaKeys.length > 0
            ? `GetDatabaseMetaValues ( metaKeys = ${JSON.stringify(
                  metaKeys,
              )} ) ;`
            : '',
    );

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
     * @name formatDBName
     * @param str
     * @returns formatted db name
     */
    const formatDBName = (str: string) => {
        let i;
        const frags = str.split('_');
        for (i = 0; i < frags.length; i++) {
            frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
        }
        return frags.join(' ');
    };

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
                selected: false,
            });
            // setFieldOptionColor(output[i].METAVALUE, output[i].METAKEY)
            return prev;
        }, {});

        // debugger;

        updated['domain'] = [
            {
                color: 'purple',
                count: 1,
                value: 'Doctor',
            },
            {
                color: 'purple',
                count: 1,
                value: 'Doctor',
            },
            {
                color: 'purple',
                count: 1,
                value: 'Doctor',
            },
        ];

        setFilterOptions(updated);
    }, [getCatalogFilters.status, getCatalogFilters.data]);

    const setSelectedFilters = () => {
        console.log('set filters');
    };

    // finish loading the page
    if (
        getDatabases.status === 'ERROR' ||
        getCatalogFilters.status === 'ERROR'
    ) {
        return <>ERROR</>;
    }

    // if (
    //     getDatabases.status === 'SUCCESS'
    // ) {
    //     debugger
    // }

    // console.log('filt options', filterOptions)

    console.log('fil visibility', filterVisibility);
    return (
        <Page
            header={
                <StyledStack
                    direction="row"
                    alignItems={'center'}
                    justifyContent={'space-between'}
                    spacing={4}
                >
                    <Stack direction="row" alignItems={'center'} spacing={2}>
                        <Typography variant={'h4'}>Catalog</Typography>
                        <Search
                            size={'small'}
                            label={'Search'}
                            onChange={(e) => {
                                setSearch(e.target.value);
                            }}
                        />
                    </Stack>
                    <Stack direction="row" alignItems={'center'} spacing={3}>
                        <Button variant={'contained'}>Add Database</Button>

                        <ToggleButtonGroup size={'small'} value={view}>
                            <ToggleButton
                                onClick={(e, v) => setView('tile')}
                                value={'tile'}
                            >
                                <SpaceDashboardOutlined />
                            </ToggleButton>
                            <ToggleButton
                                onClick={(e, v) => setView('list')}
                                value={'list'}
                            >
                                <FormatListBulletedOutlined />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                </StyledStack>
            }
        >
            <StyledContainer>
                <StyledFitler>
                    <StyledFilterList dense={true}>
                        <List.Item>
                            <List.ItemButton
                                selected={catalogType === 'database'}
                                onClick={() => {
                                    navigate(``);
                                }}
                            >
                                <List.Icon>
                                    <DataObjectOutlined />
                                </List.Icon>
                                <List.ItemText primary={'Data Catalog'} />
                            </List.ItemButton>
                        </List.Item>
                        <List.Item>
                            <List.ItemButton
                                selected={catalogType === 'storage'}
                                onClick={() => {
                                    navigate(``);
                                }}
                            >
                                <List.Icon>
                                    <Inventory2Outlined />
                                </List.Icon>
                                <List.ItemText primary={'Storage Catalog'} />
                            </List.ItemButton>
                        </List.Item>
                        <List.Item>
                            <List.ItemButton
                                selected={catalogType === 'model'}
                                onClick={() => {
                                    navigate(``);
                                }}
                            >
                                <List.Icon>
                                    <MenuBookOutlined />
                                </List.Icon>
                                <List.ItemText primary={'Model Catalog'} />
                            </List.ItemButton>
                        </List.Item>
                    </StyledFilterList>

                    {catalogType === 'database' && (
                        <StyledFilterList>
                            <List.Item>
                                <List.ItemButton
                                    selected={mode === 'My Databases'}
                                    onClick={() => setMode('My Databases')}
                                >
                                    <List.Icon>
                                        <People />
                                    </List.Icon>
                                    <List.ItemText primary={'My Databases'} />
                                </List.ItemButton>
                            </List.Item>
                            <List.Item>
                                <List.ItemButton
                                    selected={mode === 'Discoverable Databases'}
                                    onClick={() => {
                                        setMode('Discoverable Databases');
                                    }}
                                >
                                    <List.Icon>
                                        <People />
                                    </List.Icon>
                                    <List.ItemText
                                        primary={'Discoverable Databases'}
                                    />
                                </List.ItemButton>
                            </List.Item>
                        </StyledFilterList>
                    )}
                    <StyledFilterList dense={true}>
                        <List.Item>
                            <List.ItemText primary={'Filter By'} />
                        </List.Item>

                        {Object.entries(filterOptions).map((entries) => {
                            const list = entries[1];
                            return (
                                <>
                                    <List.Item
                                        secondaryAction={
                                            <List.ItemButton
                                                onClick={() => {
                                                    const visibleFilters = {
                                                        ...filterVisibility,
                                                    };
                                                    visibleFilters[entries[0]] =
                                                        !visibleFilters[
                                                            entries[0]
                                                        ];

                                                    setFilterVisibility(
                                                        visibleFilters,
                                                    );
                                                }}
                                            >
                                                {filterVisibility[
                                                    entries[0]
                                                ] ? (
                                                    <ExpandLess />
                                                ) : (
                                                    <ExpandMore />
                                                )}
                                            </List.ItemButton>
                                        }
                                    >
                                        <List.ItemText
                                            primary={formatDBName(entries[0])}
                                        />
                                    </List.Item>
                                    <Collapse in={filterVisibility[entries[0]]}>
                                        {/* <TextField
                                            label={} 
                                        /> */}
                                        <StyledNestedFilterList>
                                            {list.map((filterOption, i) => {
                                                return (
                                                    <List.Item
                                                        key={i}
                                                        secondaryAction={
                                                            filterOption.count
                                                        }
                                                    >
                                                        <List.ItemButton
                                                            selected={
                                                                filterOption.selected
                                                            }
                                                            onClick={() => {
                                                                console.log(
                                                                    'modify filter options',
                                                                    filterOption,
                                                                );

                                                                setSelectedFilters();
                                                            }}
                                                        >
                                                            <List.ItemText
                                                                primary={
                                                                    filterOption.value
                                                                }
                                                            />
                                                        </List.ItemButton>
                                                    </List.Item>
                                                );
                                            })}
                                        </StyledNestedFilterList>
                                    </Collapse>
                                </>
                            );
                        })}
                    </StyledFilterList>
                </StyledFitler>

                <StyledContent>
                    {getDatabases.status === 'SUCCESS' ? (
                        <Grid container spacing={3}>
                            {getDatabases.data.map((db) => {
                                return (
                                    <Grid
                                        key={db.database_id}
                                        item
                                        sm={view === 'list' ? 12 : 12}
                                        md={view === 'list' ? 12 : 6}
                                        lg={view === 'list' ? 12 : 4}
                                        xl={view === 'list' ? 12 : 3}
                                    >
                                        {view === 'list' ? (
                                            <DatabaseLandscapeCard
                                                name={formatDBName(db.app_name)}
                                                id={db.app_id}
                                                image={defaultDBImage}
                                                tag={db.tag}
                                                owner={db.owner}
                                                description={db.description}
                                                votes={db.upvotes}
                                                views={db.views}
                                                trending={db.trending}
                                                isGlobal={db.database_global}
                                                isUpvoted={db.hasVoted}
                                                onClick={() => {
                                                    navigate(
                                                        `/database/${db.app_id}`,
                                                    );
                                                }}
                                            />
                                        ) : (
                                            <DatabaseTileCard
                                                name={formatDBName(db.app_name)}
                                                id={db.app_id}
                                                image={defaultDBImage}
                                                tag={db.tag}
                                                owner={db.owner}
                                                description={db.description}
                                                votes={db.upvotes}
                                                views={db.views}
                                                trending={db.trending}
                                                isGlobal={db.database_global}
                                                isUpvoted={db.hasVoted}
                                                onClick={() => {
                                                    navigate(
                                                        `/database/${db.app_id}`,
                                                    );
                                                }}
                                            />
                                        )}
                                    </Grid>
                                );
                            })}
                        </Grid>
                    ) : null}
                </StyledContent>
            </StyledContainer>
            {/* <StyledCatalog>
                <StyledMenu>
                    {getCatalogFilters.status === 'SUCCESS' ? (
                        <StyledControl>
                            <StyledControlHeader>
                                <StyledControlTitle>Search</StyledControlTitle>
                            </StyledControlHeader>
                            <StyledSearch
                                size="lg"
                                value={search}
                                onChange={(s: string) => {
                                    setSearch(s);
                                }}
                            />
                            <StyledControlHeader>
                                <StyledControlTitle>Filter</StyledControlTitle>
                            </StyledControlHeader>
                            <StyledFilterOld>
                                {databaseMetaKeys.map((key) => {
                                    const { metakey, display_options } = key;

                                    // don't show if there are no options
                                    if (
                                        !filterOptions[metakey] ||
                                        filterOptions[metakey].length === 0
                                    ) {
                                        return null;
                                    }

                                    const multiple =
                                        display_options === 'multi-checklist' ||
                                        display_options === 'multi-select' ||
                                        display_options === 'multi-typeahead';

                                    return (
                                        <StyledFilterItem
                                            key={metakey}
                                            open={filterVisibility[metakey]}
                                            onClick={() => {
                                                const updated = {
                                                    ...filterVisibility,
                                                };

                                                updated[metakey] =
                                                    !updated[metakey];

                                                setFilterVisibility(updated);
                                            }}
                                        >
                                            <StyledFilterTitle>
                                                <span>
                                                    <b>
                                                        Filter by{' '}
                                                        {metakey
                                                            .slice(0, 1)
                                                            .toUpperCase() +
                                                            metakey.slice(1)}
                                                    </b>
                                                </span>
                                                <StyledFilterIcon
                                                    color="primary"
                                                    path={
                                                        'M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z'
                                                    }
                                                ></StyledFilterIcon>
                                            </StyledFilterTitle>
                                            {filterVisibility[metakey] && (
                                                <StyledFilterOpen
                                                    onClick={(event) =>
                                                        event.stopPropagation()
                                                    }
                                                >
                                                    <Checklist
                                                        defaultValue={
                                                            multiple ? [] : null
                                                        }
                                                        multiple={multiple}
                                                        options={
                                                            filterOptions[
                                                                metakey
                                                            ] || []
                                                        }
                                                        getDisplay={(
                                                            option,
                                                        ) => {
                                                            return `${option.value} (${option.count})`;
                                                        }}
                                                        getKey={(option) => {
                                                            return option.value;
                                                        }}
                                                        onChange={(option) => {
                                                            const updated = {
                                                                ...filterValues,
                                                            };

                                                            if (option) {
                                                                updated[
                                                                    metakey
                                                                ] = multiple
                                                                    ? option.map(
                                                                          (o) =>
                                                                              o.value,
                                                                      )
                                                                    : option.value;
                                                            } else {
                                                                updated[
                                                                    metakey
                                                                ] = null;
                                                            }

                                                            setFilterValues(
                                                                updated,
                                                            );
                                                        }}
                                                    />
                                                </StyledFilterOpen>
                                            )}
                                        </StyledFilterItem>
                                    );
                                })}
                            </StyledFilterOld>
                        </StyledControl>
                    ) : null}
                </StyledMenu>
                {getDatabases.status === 'SUCCESS' ? (
                    <StyledGrid gutterX={theme.space['8']}>
                        {getDatabases.data.map((database) => {
                            const database_name = String(
                                database.database_name,
                            ).replace(/_/g, ' ');

                            return (
                                <Grid.Item
                                    key={database.database_id}
                                    responsive={{
                                        sm: 12,
                                        md: 6,
                                        lg: 4,
                                        xl: 3,
                                    }}
                                >
                                    <StyledLink
                                        to={`/database/${database.database_id}`}
                                    >
                                        <DatabaseCard
                                            name={database_name}
                                            description={database.description}
                                            image={`${process.env.MODULE}/api/app-${database.database_id}/appImage/download`}
                                            tag={database.tag}
                                            global={
                                                view === 'My Databases'
                                                    ? true
                                                    : false
                                            }
                                        ></DatabaseCard>
                                    </StyledLink>
                                </Grid.Item>
                            );
                        })}
                    </StyledGrid>
                ) : null}
            </StyledCatalog> */}
        </Page>
    );
});
