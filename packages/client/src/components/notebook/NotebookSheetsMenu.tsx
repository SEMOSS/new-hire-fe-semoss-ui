import React, { useState, useEffect } from 'react';
import {
    Stack,
    IconButton,
    Icon,
    Menu,
    List,
    Divider,
    Button,
    Tabs,
    Typography,
    styled,
    useNotification,
} from '@semoss/ui';
import { Add } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useBlocks, useRootStore, useWorkspace } from '@/hooks';
import { NewQueryOverlay } from './NewQueryOverlay';
import { ActionMessages } from '@/stores';
import { ContentCopy, Download, Delete, MoreVert } from '@mui/icons-material';

const StyledSheet = styled('div', {
    shouldForwardProp: (prop) => prop !== 'selected',
})<{
    selected: boolean;
}>(({ theme, selected }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: selected
        ? theme.palette.background.paper
        : theme.palette.background.default,
    color: '#666',
    '&:hover': {
        cursor: 'pointer',
    },
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    alignItems: 'center',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    '&:hover': {
        backgroundColor: theme.palette.primary.hover,
    },
}));

const StyledListIcon = styled(List.Icon)(({ theme }) => ({
    width: theme.spacing(4),
    minWidth: 'unset',
}));

export const NotebookSheetsMenu = observer((): JSX.Element => {
    const { state, notebook } = useBlocks();

    const { workspace } = useWorkspace();
    const { monolithStore, configStore } = useRootStore();
    const notification = useNotification();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    /**
     * Selects a sheet on mount
     */
    useEffect(() => {
        if (notebook.selectedQuery) return;

        if (notebook.queriesList.length) {
            let i = 0,
                selected = false;
            while (!selected) {
                notebook.selectQuery(notebook.queriesList[i].id);
                selected = true;
                i++;
            }
        } else {
            // Create a query for user
            const id = state.dispatch({
                message: ActionMessages.NEW_QUERY,
                payload: {
                    queryId: 'default',
                    config: {
                        cells: [
                            {
                                id: `${Math.floor(Math.random() * 100000)}`,
                                widget: 'code',
                                parameters: {
                                    code: '',
                                    type: 'py',
                                },
                            },
                        ],
                    },
                },
            });

            notebook.selectQuery(id);
        }
    }, []);

    /**
     * Edit or create a query
     */
    const openQueryOverlay = () => {
        workspace.openOverlay(() => (
            <NewQueryOverlay
                onClose={(newQueryId?: string) => {
                    if (newQueryId) {
                        notebook.selectQuery(newQueryId);
                    }
                    workspace.closeOverlay();
                }}
            />
        ));
    };

    // requests download id with DownloadAppNotebook pixel and appId then downloads with monolithStore.download
    const exportHandler = async () => {
        workspace.setLoading(true);

        try {
            // export  the app
            const response = await monolithStore.runQuery<[string]>(
                `DownloadAppNotebook ( "${workspace.appId}" ) ;`,
            );

            const key = response.pixelReturn[0].output;
            // throw an error if there is no key
            // throw an error if index / size return as 0 indicating app is new and has not yet been saved
            if (!key) {
                throw new Error('Error downloading app notebook');
            } else if (key == 'Index: 0, Size: 0') {
                throw new Error(
                    'Error downloading app notebook. Save new apps before downloading.',
                );
            } else {
                // if no issues are indicated in the return download the app
                await monolithStore.download(configStore.store.insightID, key);
                notification.add({
                    color: 'success',
                    message: 'Success',
                });
            }
        } catch (e) {
            console.error(e);

            notification.add({
                color: 'error',
                message: e.message,
            });
        } finally {
            workspace.setLoading(false);
        }
    };

    /**
     * Copy a query
     * @param id - id of the query to copy
     */
    const duplicateQuery = (id: string) => {
        try {
            // get the query
            const query = state.getQuery(id);
            if (!query) {
                throw new Error(`Cannot find query ${id}`);
            }

            // get the json
            const json = query.toJSON();

            // get a new id
            const newQueryId = `${json.id} Copy`;

            // dispatch it
            state.dispatch({
                message: ActionMessages.NEW_QUERY,
                payload: {
                    queryId: newQueryId,
                    config: {
                        cells: json.cells,
                    },
                },
            });

            // close the options and select it
            handleQueryOptionsMenuClose();
            notebook.selectQuery(newQueryId);
        } catch (e) {
            // log it
            console.error(e);

            // notify the user
            notification.add({
                color: 'error',
                message: e.message,
            });
        }
    };

    const handleQueryOptionsMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Stack direction="row" spacing={0}>
            {notebook.queriesList.map((q, i) => {
                return (
                    <StyledSheet
                        key={i}
                        selected={q.id === notebook.selectedQuery?.id}
                        onClick={(e) => {
                            notebook.selectQuery(q.id);
                        }}
                    >
                        <Typography variant={'body2'} fontWeight="bold">
                            {q.id}
                        </Typography>
                        <IconButton
                            size={'small'}
                            onClick={(event: React.MouseEvent<HTMLElement>) => {
                                setAnchorEl(event.currentTarget);
                                event.stopPropagation();
                            }}
                        >
                            <MoreVert />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleQueryOptionsMenuClose}
                        >
                            <List disablePadding dense>
                                {/* <List.Item disablePadding>
                            <List.ItemButton
                                onClick={() => {
                                    notebook.selectQuery(anchorQuery?.id);
                                    handleQueryOptionsMenuClose();
                                }}
                            >
                                <StyledListIcon>
                                    <Edit color="inherit" fontSize="small" />
                                </StyledListIcon>
                                <List.ItemText primary="Edit" />
                            </List.ItemButton>
                        </List.Item> */}
                                <List.Item disablePadding>
                                    <List.ItemButton
                                        onClick={() => {
                                            duplicateQuery(q.id);
                                        }}
                                    >
                                        <StyledListIcon>
                                            <ContentCopy
                                                color="inherit"
                                                fontSize="small"
                                            />
                                        </StyledListIcon>
                                        <List.ItemText primary="Duplicate" />
                                    </List.ItemButton>
                                </List.Item>
                                <List.Item disablePadding>
                                    <List.ItemButton onClick={exportHandler}>
                                        <StyledListIcon>
                                            <Download
                                                color="inherit"
                                                fontSize="small"
                                            />
                                        </StyledListIcon>
                                        <List.ItemText primary="Export" />
                                    </List.ItemButton>
                                </List.Item>
                                <Divider />
                                <List.Item disablePadding>
                                    <List.ItemButton
                                        onClick={() => {
                                            state.dispatch({
                                                message:
                                                    ActionMessages.DELETE_QUERY,
                                                payload: {
                                                    queryId: q.id,
                                                },
                                            });
                                            // if (notebook.queriesList.length) {
                                            //     const nextQueryIndex =
                                            //         anchorQuery.index >=
                                            //         notebook.queriesList.length
                                            //             ? notebook.queriesList.length -
                                            //               1
                                            //             : anchorQuery.index;
                                            //     notebook.selectQuery(
                                            //         notebook.queriesList[nextQueryIndex]
                                            //             .id,
                                            //     );
                                            // }
                                            handleQueryOptionsMenuClose();
                                        }}
                                    >
                                        <StyledListIcon>
                                            <Delete
                                                color="error"
                                                fontSize="small"
                                            />
                                        </StyledListIcon>
                                        <List.ItemText
                                            primary="Delete"
                                            primaryTypographyProps={{
                                                color: 'error',
                                            }}
                                        ></List.ItemText>
                                    </List.ItemButton>
                                </List.Item>
                            </List>
                        </Menu>
                    </StyledSheet>
                );
            })}

            <StyledButtonContainer>
                <StyledIconButton
                    size="small"
                    onClick={() => {
                        openQueryOverlay();
                    }}
                >
                    <Icon color="primary">
                        <Add />
                    </Icon>
                </StyledIconButton>
            </StyledButtonContainer>
        </Stack>
    );
});