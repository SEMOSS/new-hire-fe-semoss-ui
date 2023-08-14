import { useState } from 'react';
import { Container, styled, ToggleTabsGroup } from '@semoss/ui';
import Editor from '@monaco-editor/react';

import { Markdown } from '../Markdown';

const StyledContainer = styled(Container)(({ theme }) => ({
    height: theme.spacing(38),
    marginBottom: theme.spacing(5),
    width: '100%',
}));

const StyledTabPanel = styled('div')(({ theme }) => ({
    height: '100%',
    width: '100%',
    overflow: 'auto',
    // border: `solid ${theme.palette.grey['300']}`
}));

const StyledEditor = styled(Editor)(({ theme }) => ({
    height: '100%',
    width: '900px',
}));

const StyledMarkdownContainer = styled('div')(({ theme }) => ({
    width: '900px',
}));

interface MarkdownEditorProps {
    /** Value of the input */
    value: string;

    /** Callback that is triggered when the value changes */
    onChange?: (value: string) => void;
}

export const MarkdownEditor = (props: MarkdownEditorProps) => {
    const { value, onChange = () => null } = props;
    const [view, setView] = useState<number>(0);

    return (
        <StyledContainer disableGutters={true}>
            <ToggleTabsGroup
                boxSx={{
                    borderRadius: '12px 12px 0px 0px',
                    width: '100%',
                }}
                value={view}
                onChange={(e: React.SyntheticEvent, val: number) => {
                    setView(val);
                }}
            >
                <ToggleTabsGroup.Item label="Edit"></ToggleTabsGroup.Item>
                <ToggleTabsGroup.Item label="View"></ToggleTabsGroup.Item>
            </ToggleTabsGroup>
            <StyledTabPanel>
                {view === 0 ? (
                    <StyledEditor
                        width={900}
                        defaultValue={value}
                        value={value}
                        language={'markdown'}
                        onChange={(newValue, e) => {
                            // Handle changes in the editor's content.
                            onChange(newValue);
                        }}
                    />
                ) : (
                    <StyledMarkdownContainer>
                        <Markdown content={value}></Markdown>
                    </StyledMarkdownContainer>
                )}
            </StyledTabPanel>
        </StyledContainer>
    );
};
