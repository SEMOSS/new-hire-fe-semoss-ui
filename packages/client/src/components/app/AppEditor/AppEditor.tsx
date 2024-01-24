// --------------------
// Notes:
// This should get moved to Context.  Think through this more.
// - what callbacks are needed and what held in state

// Handles the View of or Text Editor alongside the App Explorer (Dir struct, Dependencies)
// This needs to handle Adding of Folders and Files to projects, and editting contents of existing
// --------------------

import React, { useEffect, useState, useRef } from 'react';
import { useRootStore } from '@/hooks';
import {
    TextEditor,
    ControlledFile,
    TextEditorCodeGeneration,
} from '../../common';
import {
    Accordion,
    Button,
    Collapse,
    Modal,
    Icon,
    IconButton,
    TreeView,
    TextField,
    useNotification,
    styled,
    Typography,
    LinearProgress,
} from '@semoss/ui';

import { LoadingScreen } from '@/components/ui';

import { Icon as FiletypeIcon } from '@mdi/react';
import { FILE_ICON_MAP } from '../../common/TextEditor/text-editor.constants';

import {
    ExpandMore,
    ChevronRight,
    KeyboardDoubleArrowLeft,
    KeyboardDoubleArrowRight,
    CreateNewFolderOutlined,
    NoteAddOutlined,
    DeleteOutline,
} from '@mui/icons-material/';

const StyledTypography = styled(Typography)(({ theme }) => ({
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    flex: '1',
}));

const StyledModalContent = styled(Modal.Content)(({ theme }) => ({
    minWidth: '350px',
}));

const StyledTextEditorDiv = styled('div')(({ theme }) => ({
    backgroundColor: '#fff',
}));

// const _StyledTextEditorDiv = ({openAppAssetsPanel, children}) => {
//     // possible work-around to only remaining legacy inline style
//     // causing error in children / not rendering open files
//     // working on other component with children

//     const ReturnElement = styled('div')(({ theme }) => ({
//         width: openAppAssetsPanel ? 'calc(100% - 50px - 250px)' : 'calc(100% - 50px)',
//         backgroundColor: '#fff',
//     }));
//     return (<ReturnElement>{children}</ReturnElement>);
// }

const StyledDeleteOutlineIcon = styled(DeleteOutline)(({ theme }) => ({
    color: 'rgba(0, 0, 0, 0.3)',
}));

// wraps file icon, name and delete icon for every file in explorer
const StyledTreeViewItem = styled(TreeView.Item)(({ theme }) => ({
    '.MuiCollapse-wrapperInner': {
        height: 'auto',
        overflow: 'none',
    },
}));

const FilenameFlexWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '30px',
    width: '100%',
}));

// file icon in explorer
const FiletypeIconWrapper = styled(Icon)(({ theme }) => ({
    color: 'rgba(0, 0, 0, 0.6)',
    marginRight: '6px',
    width: '24px',
    height: '24px',
}));

const TextEditorCodeGenerationWrapper = styled('div')(({ theme }) => ({
    maxWidth: '85%',
}));

const StyledEditorPanel = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
}));

const StyledCollapseTrigger = ({ openAppAssetsPanel, children }) => {
    const ReturnElement = styled('div')(({ theme }) => ({
        boxShadow: !openAppAssetsPanel
            ? '5px 0 5px -2px rgba(0, 0, 0, 0.04)'
            : 'none',
        marginLeft: openAppAssetsPanel ? '-90px' : '0px',
        height: '100%',
        width: '50px',
        backgroundColor: theme.palette.secondary.light,
        padding: theme.spacing(1),
        display: 'absolute',
        transition: 'margin-left 0.3s ease',
    }));
    return <ReturnElement>{children}</ReturnElement>;
};

const StyledOpenAssetsContainer = styled('div')(({ theme }) => ({
    height: '5%',
}));

const StyledCollapse = styled(Collapse)(({ theme }) => ({
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    backgroundColor: theme.palette.secondary.light,
}));

const StyledCollapseContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '350px',
    height: '100%',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    boxShadow: '5px 0 5px -2px rgba(0, 0, 0, 0.04)',
}));

const StyleAppExplorerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    alignItems: 'center',
}));

const StyledAppExplorerContainer = styled('div')(({ theme }) => ({
    height: '95%',
    width: '295px',
    overflow: 'visible',
}));

const StyledAppExplorerSection = styled('div')(({ theme }) => ({
    maxHeight: '85%',
}));

const StyledTreeView = styled(TreeView)(({ theme }) => ({
    width: '100%',
    maxHeight: '100%',
    gap: '24px',
    '.MuiTreeItem-content': {
        padding: '4px',
    },
}));

const StyledRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StyledIcon = styled(Icon)(({ theme }) => ({
    color: 'rgba(0, 0, 0, .3)',
}));

const CustomAccordion = styled(Accordion)(({ theme }) => ({
    background: 'inherit',
    boxShadow: 'none',
    padding: '0',
    borderRadius: '0px',
    marginBottom: '-15px',
    '&:before': {
        display: 'none',
    },
}));

const CustomAccordionTrigger = styled(Accordion.Trigger)(({ theme }) => ({
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: '0px',
    display: 'flex',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
        transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
        marginLeft: theme.spacing(1),
    },
    '& .MuiAccordionDetails-root': {
        padding: '0px',
    },
    '.MuiSvgIcon-root': {
        width: '1.25rem',
        height: '1.25rem',
        color: 'rgba(0, 0, 0, .3)',
    },
}));

const CustomAccordionTriggerContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(4),
    height: `calc(1rem + 0px)`,
    '.MuiButtonBase-root': {
        padding: '0px',
    },
    '.MuiSvgIcon-root': {
        width: '20px',
        height: '20px',
    },
    justifyContent: 'space-between',
    width: '93%',
}));

const CustomAccordionTriggerLabel = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis ellipsis',
}));

const CustomAccordionContent = styled(Accordion.Content)(({ theme }) => ({
    maxHeight: 'calc(87.5vh - 120px)',
    overflow: 'scroll',
    width: '98%',
    display: 'flex',
    padding: '0px',
}));

interface AppEditorProps {
    /**
     * Id of App to get Directory
     */
    appId: string;
    /**
     * Width of AppEditor Panel, anytime this changes we may have to close AppExplorer
     */
    width: string;
    /**
     * On Save of edits in the text editor, I would use the hook no need for extra dependency
     */
    onSave: (success: boolean) => void;
}

interface NodeInterface {
    id: string;
    lastModified: string;
    name: string;
    path: string;
    type: string;
    children?: unknown;
}

interface FileData {
    name: string;
    path: string;
    id: string;
}

// Gets a certain amount of directories
const INITIAL_LOAD_FILE_LIMIT = 15;

export const AppEditor = (props: AppEditorProps) => {
    const { appId, width, onSave } = props;
    const { monolithStore, configStore } = useRootStore();
    const notification = useNotification();
    const [openAppAssetsPanel, setOpenAppAssetsPanel] = useState(true);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const [fileToBeDeleted, setFileToBeDeleted] = useState<FileData>({
        name: '',
        path: '',
        id: '',
    });
    const [UINodes, setUINodes] = useState(null);
    const [openAccordion, setOpenAccordion] = useState(['file']);
    const [counter, setCounter] = useState(0); // Test and remove

    /**
     * FILE EXPLORER START OF CODE
     */
    const [appDirectory, setAppDirectory] = useState([]);
    const [expanded, setExpanded] = React.useState<string[]>([]);
    const [selected, setSelected] = React.useState<string[]>([]);

    // When we gather input from add new file/folder
    const newDirectoryRefs = useRef(null);

    // Props necessary for TextEditor component
    const [filesToView, setFilesToView] = useState([]);
    const [activeFileIndex, setActiveFileIndex] = useState(null);

    // Props for hovering over trash icons, opening folders and deleted folders that shouldn't be rendered
    const [hoverSet, setHoverSet] = useState(new Set());
    const [openFolderSet, setOpenFolderSet] = useState(new Set());
    const [deletedNodesSet, setDeletedNodesSet] = useState(new Set());

    // attempting to factor these out of TextEditor for closing tabs
    const [controlledFiles, setControlledFiles] = useState<ControlledFile[]>(
        [],
    );
    const [counterTextEditor, setCounterTextEditor] = useState(0);

    // limit the number of files that are displayed on initial load
    // limit will often be exceeded due to unknown file count in folders but when limit is met no new folders will be opened
    const initialLoadFileSet = useRef(new Set());
    const [initLoadComplete, setInitLoadComplete] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // backup solution for stopping initial auto-opening folders if file limit is never met
    const firstClickHandler = () => {
        setInitLoadComplete(true);
        document.removeEventListener('click', firstClickHandler);
    };

    useEffect(() => {
        getInitialAppStructure();

        // set event listener for first user click to disable auto folder opening
        document.addEventListener('click', firstClickHandler);
    }, []);

    // helper function for recursive folder opening on initial explorer load
    const openFoldersHelper = (node) => {
        initialLoadFileSet.current = new Set([
            ...initialLoadFileSet.current,
            node.id,
        ]);

        if (initialLoadFileSet.current.size >= INITIAL_LOAD_FILE_LIMIT)
            setInitLoadComplete(true);
        if (
            node.type !== 'directory' ||
            initialLoadFileSet.current.size >= INITIAL_LOAD_FILE_LIMIT
        )
            return;

        // add to open folders set for open folder icon rendering
        const tempSet2 = new Set(openFolderSet);
        tempSet2.add(node.id);
        setOpenFolderSet(tempSet2);

        // only update appDirectory and trigger new useEffect if the folder has not been expanded yet
        if (!expanded.includes(node.id)) openFolderById(node.id);

        // recursively call on all children
        node.children.forEach(openFoldersHelper);
    };

    // recursvely opens folders until all folder contents loaded from BE, stops after user interacts with explorer
    useEffect(() => {
        if (
            initLoadComplete ||
            initialLoadFileSet.current.size >= INITIAL_LOAD_FILE_LIMIT
        )
            return;

        // if the user has not yet interacted with the page open all folders recursively
        appDirectory.forEach(openFoldersHelper);
        // only runs recursive directory check on updates to appDirectory, not continuously
    }, [appDirectory]);

    useEffect(() => {
        if (newDirectoryRefs.current) {
            if (newDirectoryRefs.current.current) {
                newDirectoryRefs.current.current.scrollIntoView({
                    behavior: 'smooth', // You can choose 'auto' for immediate scrolling
                    block: 'center', // You can choose 'end' or 'center' as well
                    inline: 'nearest', // You can choose 'start' or 'end' as well
                });
            }
        }
    }, [newDirectoryRefs.current]);

    // Anytime Panel resizes we want to close/open explorer
    useEffect(() => {
        const w = parseInt(width.replaceAll('%', ''));
        if (w < 35) {
            setOpenAppAssetsPanel(false);
        } else {
            setOpenAppAssetsPanel(true);
        }
    }, [width]);

    /**
     * Get the App Structure, first on mount
     * TODO*** Decide when i went to call this and how often (reusability)
     */
    const getInitialAppStructure = async () => {
        const pixel = `BrowseAsset(filePath=["version/assets"], space=["${appId}"]);`;
        const response = await monolithStore.runQuery(pixel);
        const output = response.pixelReturn[0].output,
            operationType = response.pixelReturn[0].operationType;

        // TODO: Error Handle
        if (operationType.indexOf('ERROR') > -1) {
            notification.add({
                color: 'error',
                message: output,
            });
            return false;
        }

        const formattedNodes = [];

        output.forEach((node, i) => {
            const nodeWithID = {
                ...node,
                id: node.path,
            };
            if (node.type === 'directory') {
                formattedNodes.push({
                    ...nodeWithID,
                    children: [
                        {
                            id: `${node.path}/${i}`,
                            lastModified: '',
                            name: '',
                            path: '',
                            type: '',
                        },
                    ],
                });
            } else {
                formattedNodes.push(nodeWithID);
            }
        });

        const formattedDirectoryNodes = sortArrayOfObjects(
            formattedNodes,
            'type',
        );

        setAppDirectory(formattedDirectoryNodes);
    };

    /**
     * Selected node in App Directory.
     * 1. Open folder or View File selected node
     * 2. Select in state for TreeView component
     * @param event
     * @param nodeIds
     */
    const viewAsset = async (
        nodeIds: string[],
        event?: React.SyntheticEvent,
    ) => {
        if (nodeIds[0].indexOf('<>') > -1) {
            return;
        }

        // Gets the Selected Node in Tree View if present
        const foundNode = findNodeById(appDirectory, nodeIds[0]);

        let pixel = '',
            selectionType = 'directory';

        if (!foundNode) {
            pixel += `BrowseAsset(filePath=["version/assets"], space=["${appId}"]);`;
        } else if (foundNode.type === 'directory') {
            pixel += `BrowseAsset(filePath=["${foundNode.path}"], space=["${appId}"]);`;
            selectionType = 'directory';
        } else {
            pixel += `GetAsset(filePath=["${foundNode.path}"], space=["${appId}"]);`;
            selectionType = 'asset';
        }

        const response = await monolithStore.runQuery(pixel);

        const folderContents = response.pixelReturn[0].output,
            operationType = response.pixelReturn[0].operationType;

        if (operationType.indexOf('ERROR') > -1) {
            notification.add({
                color: 'error',
                message: folderContents,
            });
            return false;
        }

        // Determine whether we need to populate text editor or not with selected node
        if (selectionType === 'directory') {
            const newNodeChildren = [];

            if (folderContents.length) {
                folderContents.forEach((fc, i) => {
                    newNodeChildren.push({
                        ...fc,
                        id: fc.path,
                        children:
                            fc.type !== 'directory'
                                ? undefined
                                : [
                                      {
                                          id: `${fc.path}/${i}`,
                                          lastModified: '',
                                          name: '',
                                          path: '',
                                          type: '',
                                      },
                                  ],
                    });
                });
            } else {
                newNodeChildren.push({
                    id: '',
                    lastModified: '',
                    name: '',
                    path: '',
                    type: '',
                });
            }

            const formattedDirectoryNodes = sortArrayOfObjects(
                newNodeChildren,
                'type',
            );

            let updatedTreeData = [];

            if (foundNode) {
                updatedTreeData = updateNodeRecursively(
                    appDirectory,
                    foundNode.id,
                    {
                        ...foundNode,
                        children: formattedDirectoryNodes,
                    },
                );
            }

            setAppDirectory(
                foundNode ? updatedTreeData : formattedDirectoryNodes,
            );
        } else {
            const fileToAdd = {
                id: foundNode.id,
                name: foundNode.name,
                original: folderContents,
                type: foundNode.type,
                active: true,
            };
            const newFiles = filesToView;
            let activeIndex = 0;

            // Track to see if file is already present
            if (!filesToView.length) {
                newFiles.push(fileToAdd);
            } else {
                let foundFile = false;

                filesToView.forEach((prevFile, i) => {
                    if (prevFile.id === foundNode.id) {
                        foundFile = true;
                        newFiles[i] = {
                            ...newFiles[i],
                            active: true,
                        };

                        activeIndex = i;
                    } else {
                        newFiles[i] = {
                            ...newFiles[i],
                            active: false,
                        };
                    }
                });

                if (!foundFile) {
                    newFiles.push(fileToAdd);
                    activeIndex = newFiles.length - 1;
                }
            }

            setFilesToView(newFiles);
            setActiveFileIndex(activeIndex);
        }

        // No issues with reactor, set selected nodes for visual representation
        if (initLoadComplete) setSelected(nodeIds);

        // return nodeIds;
    };

    /**
     * 1. Save the Application Asset with *Pixel*
     * 2. Commit the Application Asset with *Pixel*
     * 2. Refresh the Application/IFRAME view
     */
    const saveApplicationAsset = async (
        file: ControlledFile,
    ): Promise<boolean> => {
        console.warn('Saving App Asset with Pixel');
        const pixel = `
            SaveAsset(fileName=["${file.id}"], content=["<encode>${file.content}</encode>"], space=["${appId}"]); 
            CommitAsset(filePath=["${file.id}"], comment=["Hardcoded comment from the App Page editor"], space=["${appId}"])
        `;

        const response = await monolithStore.runQuery(pixel);

        const output = response.pixelReturn[0].output,
            operationType = response.pixelReturn[0].operationType,
            outputTwo = response.pixelReturn[1].output,
            operationTypeTwo = response.pixelReturn[1].operationType;

        if (operationType.indexOf('ERROR') > -1) {
            notification.add({
                color: 'error',
                message: output,
            });
            return false;
        }

        if (operationTypeTwo.indexOf('ERROR') > -1) {
            notification.add({
                color: 'error',
                message: outputTwo,
            });
        }

        // success notification
        notification.add({
            color: 'success',
            message: `Your file has been saved!`,
        });

        // Refreshes App Renderer
        onSave(true);

        // Visual Save in Text Editor
        return true;
    };

    /**
     * @desc This adds the placeholder node to your app directory
     */
    const addAssetToApp = async (
        node,
        newNodeName: string,
        assetType: 'directory' | 'file',
    ) => {
        let pixel = '';

        // We may not have to do below --
        const nodeReplacement = node;
        nodeReplacement.id = node.id.replace(/</g, '').replace(/>/g, '');
        nodeReplacement.id = nodeReplacement.id + newNodeName + '/';
        nodeReplacement.path = nodeReplacement.id;
        nodeReplacement.name = newNodeName;
        nodeReplacement.lastModified = Date.now();
        // --

        if (assetType === 'directory') {
            pixel += `
            MakeDirectory(filePath=["${nodeReplacement.id}"], space=["${appId}"]);
            `;
        } else {
            pixel += `
            SaveAsset(fileName=["${nodeReplacement.id}"], content=["<encode></encode>"], space=["${appId}"]);
            `;
        }

        const { parent } = await findNodeAndParentById(appDirectory, node.id);
        const response = await monolithStore.runQuery(pixel);

        const output = response.pixelReturn[0].output,
            operationType = response.pixelReturn[0].operationType;

        if (operationType.indexOf('ERROR') > -1) {
            notification.add({
                color: 'error',
                message: output,
            });

            await viewAsset(!parent ? ['version/assets/'] : [parent.id]);
            if (initLoadComplete) setSelected(parent ? [parent.id] : []);
            return;
        }

        // save nodeReplacement in tree
        if (assetType === 'directory') {
            await viewAsset([parent ? parent.id : ['version/assets']]);
            if (initLoadComplete) setSelected([nodeReplacement.id]);
        } else {
            const commitAssetPixel = `
            CommitAsset(filePath=["${nodeReplacement.id}"], comment=["Added Asset from App Editor: path='${nodeReplacement.id}' "], space=["${appId}"])
            `;

            const commitAssetResponse = await monolithStore.runQuery(
                commitAssetPixel,
            );

            const commitAssetOutput = commitAssetResponse.pixelReturn[0].output,
                commitAssetOperationType =
                    commitAssetResponse.pixelReturn[0].operationType;

            // TODO: FE code for commit asset
            console.log(
                'TODO: Committing the Asset, view parent directory to refresh app structure after?',
            );
        }

        // if id matches recently deleted file or directory needs to be removed from the deleted files set so it renders
        const newDeletedNodesSet = new Set(deletedNodesSet);
        newDeletedNodesSet.delete(node.id);
        setDeletedNodesSet(newDeletedNodesSet);

        // set this file as the active file in the editor

        // if (initLoadComplete) setSelected([nodeReplacement.id]);
        setCounter(counter + 1);
    };

    /**
     * Method that is called to download the app
     */
    const downloadApp = async () => {
        try {
            const path = 'version/assets/';

            // upnzip the file in the new app
            const response = await monolithStore.runQuery(
                `DownloadAsset(filePath=["${path}"], space=["${appId}"]);`,
            );

            const key = response.pixelReturn[0].output;
            if (!key) {
                throw new Error('Error Downloading Asset');
            }

            await monolithStore.download(configStore.store.insightID, key);
        } catch (e) {
            console.error(e);

            notification.add({
                color: 'error',
                message: e.message,
            });
        }
    };

    /**
     * Accordion for Dependencies and Files
     */
    const handleAccordionChange = (type: 'dependency' | 'file') => {
        const newOpenAccords = openAccordion;
        if (openAccordion.indexOf(type) > -1) {
            newOpenAccords.splice(openAccordion.indexOf(type), 1);
        } else {
            newOpenAccords.push(type);
        }
        setOpenAccordion(newOpenAccords);
        // Band aid fix: refresh ui state change is a step behind
        setCounter(counter + 1);
    };

    /**
     * Sets Expanded Folders
     * @param event
     * @param nodeIds
     */
    const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
        setOpenFolderSet(new Set(nodeIds));
        setExpanded(nodeIds);
    };

    /**
     * Sorts the directory structure before putting into state.
     * @param arr
     * @param propertyName
     * @param order
     * @returns
     */
    const sortArrayOfObjects = (arr, propertyName) => {
        const sortedArr = arr.sort((a, b) => {
            if (
                a[propertyName] === 'directory' &&
                b[propertyName] !== 'directory'
            ) {
                return -1; // 'directory' comes before other types
            }
            if (
                a[propertyName] !== 'directory' &&
                b[propertyName] === 'directory'
            ) {
                return 1; // 'directory' comes before other types
            }
            if (a[propertyName] < b[propertyName]) {
                return -1;
            }
            if (a[propertyName] > b[propertyName]) {
                return 1;
            }
            return 0;
        });
        return sortedArr;
    };

    // ----------------------------
    // Node Functions -------------
    // ----------------------------
    /**
     * @desc
     * This really needs to just set a placeholder Node in our Tree view.
     * To help us gather input for new file/folder name or contents
     */
    const addPlaceholderNode = (type: 'directory' | 'file') => {
        const newNode = {
            id: '',
            lastModified: '',
            name: '',
            path: '',
            type: type,
            // id: `${foundNode.id}<>`,
        };

        // 1. See where we are in app directory, needed to know where to add file/dir
        if (!expanded.length) {
            console.log('Handle top level dir addition', appDirectory);
            const appDirCopy = appDirectory;
            newNode.id = 'version/assets/<>';

            if (type === 'directory') {
                newNode['children'] = [
                    {
                        id: `version/assets/<>/`,
                        lastModified: '',
                        name: 'placeholder',
                        path: `version/assets/<>/`,
                        type: '',
                    },
                ];
            }

            appDirCopy.push(newNode);

            const formattedDirectoryNodes = sortArrayOfObjects(
                appDirCopy,
                'type',
            );

            setAppDirectory(formattedDirectoryNodes);
            // Band Aid fix update UI with state change
            setCounter(counter + 1);
        } else {
            console.log('Handles nodes that have a parent');
            const indexOfSelectedDirectory = expanded.indexOf(selected[0]);

            let foundNode;
            if (indexOfSelectedDirectory < 0) {
                const selectedFilesParent = selected[0].substring(
                    0,
                    selected[0].lastIndexOf('/') + 1,
                );
                foundNode = findNodeById(appDirectory, selectedFilesParent);
            } else {
                foundNode = findNodeById(
                    appDirectory,
                    !expanded.length ? '' : expanded[indexOfSelectedDirectory],
                );
            }

            // 2. Add new NodeInterface to the chidren of that directory
            const nodeChildrenCopy = foundNode.children;

            newNode.id = `${foundNode.id}<>`;

            if (type === 'directory') {
                newNode['children'] = [
                    {
                        id: `${foundNode.id}<>/`,
                        lastModified: '',
                        name: 'placeholder',
                        path: `${foundNode.id}<>/`,
                        type: '',
                    },
                ];
            }

            nodeChildrenCopy.push(newNode);

            const formattedDirectoryNodes = sortArrayOfObjects(
                nodeChildrenCopy,
                'type',
            );

            const updatedTreeData = updateNodeRecursively(
                appDirectory,
                foundNode.id,
                {
                    ...foundNode,
                    children: formattedDirectoryNodes,
                },
            );

            // 3. Update it in state
            setAppDirectory(updatedTreeData);
        }
    };

    /**
     * @desc will remove the indexed file, in files to view,
     * Should trigger the useEffect in TextEditor
     */
    const removeFileToView = (index: number) => {
        const newFilesToView = filesToView;
        newFilesToView.splice(index, 1);

        if (activeFileIndex > index) {
            // Selected index is less than active
            setActiveFileIndex(activeFileIndex - 1);
        } else if (activeFileIndex > newFilesToView.length - 1) {
            // If Active File Index is out of bounds we have to subract 1
            setActiveFileIndex(newFilesToView.length - 1);
        }

        setFilesToView(newFilesToView);
        return true;
    };

    /**
     * Tree View
     * removes a node by its id
     */
    const removeNodeById = async (nodes, targetId) => {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.id === targetId) {
                // Remove the node from its parent's children array
                nodes.splice(i, 1);
                return true; // Node was found and removed
            }
            if (node.children && node.children.length > 0) {
                const nodeRemoved = await removeNodeById(
                    node.children,
                    targetId,
                );
                if (nodeRemoved) {
                    return true; // Node was found and removed from children
                }
            }
        }
        return false; // Node with the specified ID not found
    };

    /**
     * Tree View add Asset
     * finds parent and node
     * need a version of this to recursively find child nodes / directories to collapse child dirs on parent dir collapse
     */
    const findNodeAndParentById = (nodes, targetId, parent = null) => {
        for (const node of nodes) {
            if (node.id === targetId) {
                return { node, parent }; // Found the node with the specified ID and its parent
            }
            if (node.children && node.children.length > 0) {
                const result = findNodeAndParentById(
                    node.children,
                    targetId,
                    node,
                );
                if (result.node) {
                    return result; // Found the node within children, along with its parent
                }
            }
        }
        return { node: null, parent: null }; // Node with the specified ID not found in the subtree
    };

    /**
     * Tree View
     * Recursive function to find a node by its ID
     */
    const findNodeById = (nodes, targetId) => {
        for (const node of nodes) {
            if (node.id === targetId) {
                return node; // Found the node with the specified ID
            }
            if (node.children && node.children.length > 0) {
                const foundNode = findNodeById(node.children, targetId);
                if (foundNode) {
                    return foundNode; // Found the node within children
                }
            }
        }
        return null; // Node with the specified ID not found in the subtree
    };

    /**
     * Tree View
     * @param nodes
     * @param targetId
     * @param updatedData
     * @returns
     */
    const updateNodeRecursively = (nodes, targetId, updatedData) => {
        return nodes.map((node) => {
            if (node.id === targetId) {
                // Update the properties of the target node
                return { ...node, ...updatedData };
            } else if (node.children && node.children.length > 0) {
                // Recursively update child nodes
                return {
                    ...node,
                    children: updateNodeRecursively(
                        node.children,
                        targetId,
                        updatedData,
                    ),
                };
            }
            return node;
        });
    };

    // ----------------------------
    // Render Helpers -------------
    // ----------------------------
    /**
     * Recursively render Tree Nodes based on nodes children
     * Different Types of TreeNodes
     * - Defined In Project Node
     * - New file/dir added input Node
     */
    const renderTreeNodes = (nodes) => {
        return nodes.map((node, i) => {
            // 1. New nodes that need a name

            // stop blank space from rendering in empty folders
            if (node.name.length < 1 && !node.id.includes('<>')) return;

            if (node.name === '' && node.id.includes('<>')) {
                if (!node.id) return <></>; // empty directory

                newDirectoryRefs.current = React.createRef();

                // 1a. While we are rendering tree nodes we need to set a ref for the placeholders
                return (
                    <StyledTreeViewItem
                        ref={newDirectoryRefs.current}
                        key={node.id}
                        nodeId={node.id}
                        title={'placeholder'}
                        label={
                            <TextField
                                size="small"
                                autoFocus={true}
                                onBlur={async (e) => {
                                    e.stopPropagation();
                                    // 1. if name is still an empty string remove placeholder node
                                    if (e.target.value === '') {
                                        console.warn(
                                            'onBlur without new file/folder name present',
                                        );
                                        notification.add({
                                            color: 'error',
                                            message: `Please provide a ${node.type} name`,
                                        });
                                        const { parent } =
                                            await findNodeAndParentById(
                                                appDirectory,
                                                node.id,
                                            );

                                        await viewAsset([
                                            !parent
                                                ? ['version/assets/']
                                                : parent.id,
                                        ]);
                                        if (initLoadComplete)
                                            setSelected([parent.id]);
                                        return;
                                    }
                                    // 2. save the asset and change interface accordingly
                                    addAssetToApp(
                                        node,
                                        e.target.value,
                                        node.type,
                                    );
                                }}
                                onClick={(e) => {
                                    console.log(
                                        'removed event bubbling on TreeItem',
                                    );
                                    e.stopPropagation();
                                }}
                                onKeyDown={async (e) => {
                                    e.stopPropagation();
                                    // listen for on enter on Input
                                    if (e.code === 'Enter') {
                                        const value =
                                            (
                                                e.target as unknown as {
                                                    value?: string;
                                                }
                                            )?.value || '';

                                        if (!value) {
                                            console.warn(
                                                'onBlur without new file/folder name present',
                                            );
                                            notification.add({
                                                color: 'error',
                                                message: `Please provide a ${node.type} name`,
                                            });

                                            const { parent } =
                                                await findNodeAndParentById(
                                                    appDirectory,
                                                    node.id,
                                                );

                                            await viewAsset([
                                                !parent
                                                    ? ['version/assets/']
                                                    : parent.id,
                                            ]);
                                            if (initLoadComplete)
                                                setSelected(
                                                    !parent
                                                        ? ['version/assets/']
                                                        : [parent.id],
                                                );
                                            return;
                                        }
                                        // 2. save the asset and change interface accordingly
                                        addAssetToApp(node, value, node.type);
                                    }
                                }}
                            />
                        }
                    >
                        {node.children && node.children.length > 0
                            ? renderTreeNodes(node.children)
                            : null}
                    </StyledTreeViewItem>
                );
                // backup check to make sure node has not been deleted
            } else if (!deletedNodesSet.has(node.id)) {
                // 2. Node that is defined in tree
                return (
                    <StyledTreeViewItem
                        key={node.id}
                        nodeId={node.id}
                        title={node.id}
                        label={
                            <FilenameFlexWrapper
                                onMouseEnter={() =>
                                    setHoverSet(new Set([node.id]))
                                }
                                onMouseLeave={() => setHoverSet(new Set())}
                            >
                                <FiletypeIconWrapper>
                                    <FiletypeIcon
                                        path={
                                            node.type === 'directory'
                                                ? openFolderSet.has(node.id)
                                                    ? FILE_ICON_MAP.open
                                                    : FILE_ICON_MAP.directory
                                                : FILE_ICON_MAP[node.type] ||
                                                  // if the file has just been created it will need to parse id for correct filetype icon
                                                  FILE_ICON_MAP[
                                                      node.id
                                                          .split('/')
                                                          [
                                                              node.id.split('/')
                                                                  .length - 2
                                                          ].split('.')[1]
                                                  ] ||
                                                  FILE_ICON_MAP.default
                                        }
                                    ></FiletypeIcon>
                                </FiletypeIconWrapper>
                                <StyledTypography variant="body1">
                                    {node.name}
                                </StyledTypography>
                                {hoverSet.has(node.id) && (
                                    <IconButton
                                        onClick={() => {
                                            fileDeleteHandler(nodes, node);
                                        }}
                                        size="small"
                                    >
                                        <StyledDeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </FilenameFlexWrapper>
                        }
                    >
                        {node.children && node.children.length > 0
                            ? renderTreeNodes(node.children)
                            : null}
                    </StyledTreeViewItem>
                );
            }
        });
    };

    const removeFileFromFilesToViewById = (targetFile) => {
        const newFilesToView = [];
        for (let i = 0; i < filesToView.length; i++) {
            const currFile = filesToView[i];
            if (currFile.id !== targetFile.id) {
                newFilesToView.push(currFile);
            }
        }

        setActiveFileIndex(0);
        setFilesToView(newFilesToView);
    };

    const confirmFileDeleteHandler = async () => {
        try {
            await monolithStore.runQuery(
                `DeleteAsset(filePath=["${fileToBeDeleted.path}"], space=["${appId}"]);`,
            );

            await removeNodeById(UINodes, fileToBeDeleted.id);

            notification.add({
                color: 'success',
                message: `${fileToBeDeleted.name} successfully deleted.`,
            });

            // Current fix for folders not being removed from explorer on delete
            const newDeletedNodesSet = new Set(deletedNodesSet);
            newDeletedNodesSet.add(fileToBeDeleted.id);
            setDeletedNodesSet(newDeletedNodesSet);

            // working using props factored out from TextEditor, testing no bugs found yet
            closeCurrentTab();

            setIsDeleteConfirmOpen(false);
        } catch {
            notification.add({
                color: 'error',
                message: `Error: ${fileToBeDeleted.name} was not deleted.`,
            });

            setIsDeleteConfirmOpen(false);
        }
    };

    const fileDeleteHandler = async (nodes, targetNode) => {
        setFileToBeDeleted(targetNode);
        setUINodes(nodes);
        setIsDeleteConfirmOpen(true);
    };

    const closeCurrentTab = () => {
        console.warn(' closing tab', controlledFiles);

        const newControlledFiles = controlledFiles;
        newControlledFiles.splice(activeFileIndex, 1);

        setControlledFiles(newControlledFiles);

        // close this index, set state of files in parent
        // await onClose(i);
        removeFileToView(activeFileIndex);

        // Refresh Active File Memoized value
        setCounterTextEditor(counterTextEditor + 1);
    };

    const openFolderById = (nodeId) => {
        const foundNode = findNodeById(appDirectory, nodeId);
        setExpanded([...expanded, nodeId]); // rotates folder carret

        const formattedChildren = sortArrayOfObjects(
            foundNode.children,
            'type',
        );

        const updatedTreeData = updateNodeRecursively(appDirectory, nodeId, {
            ...foundNode,
            children: formattedChildren,
        });

        viewAsset([nodeId]);
        setAppDirectory(updatedTreeData);
    };

    // only
    if (!initLoadComplete) {
        return (
            <LoadingScreen.Trigger description="Retrieving files from application..." />
        );
    }

    return (
        <StyledEditorPanel>
            {/* If Open: Displays App Explorer */}
            <StyledCollapse
                in={openAppAssetsPanel}
                timeout="auto"
                orientation={'horizontal'}
            >
                {/* Move into smaller component */}
                <StyledCollapseContainer>
                    <StyleAppExplorerHeader>
                        <Typography variant="h6">Explorer</Typography>
                    </StyleAppExplorerHeader>
                    <StyledAppExplorerContainer>
                        <StyledAppExplorerSection>
                            <CustomAccordion
                                disableGutters
                                square={true}
                                // ### expanded
                                expanded={
                                    openAccordion.indexOf('file') > -1
                                        ? true
                                        : false
                                }
                                onChange={() => {
                                    setExpanded([]);
                                    if (initLoadComplete) setSelected([]);
                                    handleAccordionChange('file');
                                }}
                            >
                                <CustomAccordionTrigger
                                    expandIcon={<ChevronRight />}
                                >
                                    <CustomAccordionTriggerContent>
                                        <CustomAccordionTriggerLabel>
                                            <Typography variant="body1">
                                                Files
                                            </Typography>
                                        </CustomAccordionTriggerLabel>
                                        {openAccordion.indexOf('file') > -1 ? (
                                            <StyledRow>
                                                <IconButton
                                                    size={'small'}
                                                    onClick={(e) => {
                                                        console.log(
                                                            'Add a file to App',
                                                        );
                                                        e.stopPropagation();
                                                        addPlaceholderNode(
                                                            'file',
                                                        );
                                                    }}
                                                >
                                                    <NoteAddOutlined />
                                                </IconButton>
                                                <IconButton
                                                    size={'small'}
                                                    onClick={(e) => {
                                                        console.log(
                                                            'Add a directory to App',
                                                        );

                                                        e.stopPropagation();
                                                        addPlaceholderNode(
                                                            'directory',
                                                        );
                                                    }}
                                                >
                                                    <CreateNewFolderOutlined />
                                                </IconButton>
                                            </StyledRow>
                                        ) : null}
                                    </CustomAccordionTriggerContent>
                                </CustomAccordionTrigger>
                                <CustomAccordionContent>
                                    <StyledTreeView
                                        multiSelect
                                        // ### explanded
                                        expanded={expanded}
                                        selected={selected}
                                        onNodeToggle={handleToggle}
                                        onNodeSelect={(e, v) => {
                                            viewAsset(v, e);
                                        }}
                                        defaultCollapseIcon={
                                            <StyledIcon>
                                                <ExpandMore />
                                            </StyledIcon>
                                        }
                                        defaultExpandIcon={
                                            <StyledIcon>
                                                <ChevronRight />
                                            </StyledIcon>
                                        }
                                    >
                                        {renderTreeNodes(appDirectory)}
                                    </StyledTreeView>
                                </CustomAccordionContent>
                            </CustomAccordion>
                        </StyledAppExplorerSection>

                        {/* Dependencies */}
                        {/* <StyledAppExplorerSection>
                            <CustomAccordion
                                disableGutters
                                square={true}
                                expanded={
                                    openAccordion.indexOf('dependency') > -1
                                        ? true
                                        : false
                                }
                                onChange={() => {
                                    setExpanded([]);
                                    if (initLoadComplete) setSelected([]);
                                    handleAccordionChange('dependency');
                                }}
                            >
                                <CustomAccordionTrigger
                                    expandIcon={<ChevronRight />}
                                >
                                    <CustomAccordionTriggerContent>
                                        <CustomAccordionTriggerLabel>
                                            <Typography variant="body1">
                                                Dependencies
                                            </Typography>
                                        </CustomAccordionTriggerLabel>
                                    </CustomAccordionTriggerContent>
                                </CustomAccordionTrigger>

                                <CustomAccordionContent>
                                    <Typography variant="body1">
                                        Currently in Progress ...
                                    </Typography>
                                </CustomAccordionContent>
                            </CustomAccordion>
                        </StyledAppExplorerSection> */}
                    </StyledAppExplorerContainer>
                    {process.env.NODE_ENV == 'development' && (
                        <TextEditorCodeGenerationWrapper>
                            <TextEditorCodeGeneration />
                        </TextEditorCodeGenerationWrapper>
                    )}
                </StyledCollapseContainer>
            </StyledCollapse>

            {/* Collapse Trigger Container */}
            <StyledCollapseTrigger openAppAssetsPanel={openAppAssetsPanel}>
                <StyledOpenAssetsContainer>
                    {openAppAssetsPanel ? (
                        <IconButton
                            size="small"
                            onClick={() => {
                                setOpenAppAssetsPanel(false);
                            }}
                        >
                            <KeyboardDoubleArrowLeft />
                        </IconButton>
                    ) : (
                        <IconButton
                            size="small"
                            onClick={() => {
                                setOpenAppAssetsPanel(true);
                            }}
                        >
                            <KeyboardDoubleArrowRight />
                        </IconButton>
                    )}
                </StyledOpenAssetsContainer>
            </StyledCollapseTrigger>

            {/* Text Editor */}
            <StyledTextEditorDiv
                // openAppAssetsPanel={openAppAssetsPanel}

                // only remaining inline style, mui styled workaround commented out above breaking TextEditor
                style={{
                    width: openAppAssetsPanel
                        ? 'calc(100% - 50px - 250px)'
                        : 'calc(100% - 50px)',
                }}
            >
                <TextEditor
                    // attempting to pass these in from parent for tab close
                    controlledFiles={controlledFiles}
                    setControlledFiles={setControlledFiles}
                    counter={counterTextEditor}
                    setCounter={setCounterTextEditor}
                    files={filesToView}
                    activeIndex={activeFileIndex}
                    setActiveIndex={(val: number) => {
                        setActiveFileIndex(val);
                    }}
                    onSave={(asset: ControlledFile) => {
                        console.log(
                            'App Editor onSave callback, hit Save Asset reactor and Refresh AppRenderer',
                            // asset,
                        );
                        // Hit Save Asset Reactor for App
                        return saveApplicationAsset(asset);
                    }}
                    onClose={(index: number) => {
                        console.log('remove activeFileIndex from filesToView');
                        removeFileToView(index);
                    }}
                />
            </StyledTextEditorDiv>

            {/* Delete Confirmation Modal */}
            <Modal open={isDeleteConfirmOpen}>
                {/* used same basic text / styling from MembersTable delete member modal except for minimum width in Modal.Content */}
                <Modal.Title>Are you sure?</Modal.Title>
                <StyledModalContent>
                    This will delete <b>{fileToBeDeleted.name}</b>
                </StyledModalContent>
                <Modal.Actions>
                    <Button
                        variant={'outlined'}
                        onClick={() => {
                            setIsDeleteConfirmOpen(false);
                        }}
                    >
                        Close
                    </Button>
                    <Button
                        color={'error'}
                        variant={'contained'}
                        onClick={() => {
                            confirmFileDeleteHandler();
                        }}
                    >
                        Confirm
                    </Button>
                </Modal.Actions>
            </Modal>
        </StyledEditorPanel>
    );
};