import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { styled, Stack, Button } from '@semoss/ui';

import { BlockSettingsComponent } from '@/stores';
import { useBlockSettings } from '@/hooks';

const StyledEditor = styled('div')(({ theme }) => ({
    height: '400px',
    width: '100%',
    border: `1px solid ${theme.palette.divider}`,
}));

export const JsonSettings: BlockSettingsComponent = ({ id }) => {
    const { data, setData } = useBlockSettings(id);

    const [value, setValue] = useState('');

    /**
     * Update the value when the block's data changes
     */
    useEffect(() => {
        if (!data) {
            setValue('');
            return;
        }

        setValue(JSON.stringify(data, null, 4));
    }, [data ? JSON.stringify(data, null, 4) : null]);

    /**
     * Update the data
     */
    const updateData = () => {
        try {
            setData('', JSON.parse(value));
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <Stack>
            <StyledEditor>
                <Editor
                    width={'100%'}
                    height={'100%'}
                    value={value}
                    language={'json'}
                    onChange={(newValue) => {
                        setValue(newValue);
                    }}
                ></Editor>
            </StyledEditor>
            <Stack
                direction="row"
                justifyContent={'center'}
                alignItems={'center'}
            >
                <Button variant="contained" onClick={() => updateData()}>
                    Update
                </Button>
            </Stack>
        </Stack>
    );
};
