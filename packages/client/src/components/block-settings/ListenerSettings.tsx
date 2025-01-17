import { observer } from 'mobx-react-lite';
import {
    Typography,
    IconButton,
    Button,
    List,
    useNotification,
    styled,
} from '@semoss/ui';

import { useBlockSettings, useBlocks, useWorkspace } from '@/hooks';
import { ACTIONS_DISPLAY, BlockDef, ListenerActions } from '@/stores';
import {
    Add,
    Delete,
    Edit,
    PlayCircleOutlineRounded,
} from '@mui/icons-material';

import { ListenerActionOverlay } from './ListenerActionOverlay';

const StyledStatusIconContainer = styled('div')(() => ({
    height: '100%',
    width: '1.5em',
    display: 'flex',
}));

const StyledRedDot = styled('div')(({ theme }) => ({
    width: '.50em',
    height: '.50em',
    backgroundColor: theme.palette.error.main,
    borderRadius: '50%',
}));

const StyledGreenDot = styled('div')(({ theme }) => ({
    width: '.50em',
    height: '.50em',
    backgroundColor: theme.palette.success.main,
    borderRadius: '50%',
}));

/**
 * TODO: reorganize and update the styling once app/blocks is up and working
 */
interface ListenerSettingsProps<D extends BlockDef = BlockDef> {
    /**
     * Id of the block that is being worked with
     */
    id: string;

    /**
     * Lisetner to update
     */
    listener: Extract<keyof D['listeners'], string>;
}

export const ListenerSettings = observer(
    <D extends BlockDef = BlockDef>({
        id,
        listener,
    }: ListenerSettingsProps<D>) => {
        const { state } = useBlocks();
        const { listeners, setListener } = useBlockSettings(id);
        const { workspace } = useWorkspace();
        const notification = useNotification();

        /**
         * Open the overlay to create a edit action
         *
         * @param action - index of the action to edit. Will create a new one if -1
         */
        const runAction = (action: ListenerActions) => {
            try {
                // dispatch it
                state.dispatch(action);
            } catch (e) {
                notification.add({
                    color: 'error',
                    message: e.message,
                });

                console.error(e);
            }
        };

        /**
         * Get the status of the query to display icon
         *
         */
        const getQueryStatusIcon = (a) => {
            if (a.message === 'RUN_QUERY') {
                const query = state.getQuery(a.payload.queryId);
                if (query && query.isSuccessful) {
                    return <StyledGreenDot />;
                } else if (query && query.isError) {
                    return <StyledRedDot />;
                } else {
                    return;
                }
            } else {
                return;
            }
        };

        /**
         * Open the overlay to create a edit action
         *
         * @param actionIdx - index of the action to edit. Will create a new one if -1
         */
        const openActionOverlay = (actionIdx = -1) => {
            workspace.openOverlay(() => {
                return (
                    <ListenerActionOverlay
                        id={id}
                        listener={listener}
                        actionIdx={actionIdx}
                        onClose={() => workspace.closeOverlay()}
                    />
                );
            });
        };

        /**
         * Open the overlay to create a edit action
         *
         * @param actionIdx - index of the action to edit. Will create a new one if -1
         */
        const deleteListener = (actionIdx: number) => {
            // copy it
            const updated = [...listeners[listener]];

            // remove it
            updated.splice(actionIdx, 1);

            setListener(listener, updated);
        };

        return (
            <>
                <List disablePadding={true}>
                    {listeners[listener]?.map((a, aIdx) => (
                        <List.Item
                            dense={true}
                            key={aIdx}
                            secondaryAction={
                                <>
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => runAction(a)}
                                    >
                                        <PlayCircleOutlineRounded
                                            fontSize="medium"
                                            color={'inherit'}
                                        />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => openActionOverlay(aIdx)}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => deleteListener(aIdx)}
                                    >
                                        <Delete />
                                    </IconButton>
                                </>
                            }
                        >
                            <StyledStatusIconContainer>
                                {getQueryStatusIcon(a)}
                            </StyledStatusIconContainer>
                            <List.ItemText
                                disableTypography={true}
                                primary={
                                    <Typography
                                        variant="body2"
                                        noWrap={true}
                                        title={ACTIONS_DISPLAY[a.message]}
                                    >
                                        {ACTIONS_DISPLAY[a.message]}
                                    </Typography>
                                }
                            />
                        </List.Item>
                    ))}
                </List>

                <Button
                    fullWidth={true}
                    variant={'outlined'}
                    size="small"
                    onClick={() => openActionOverlay(-1)}
                    startIcon={<Add />}
                >
                    New Action
                </Button>
            </>
        );
    },
);
