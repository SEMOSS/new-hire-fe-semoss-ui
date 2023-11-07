import { BlockConfig } from '@/stores';
import { InputTypeSettings, InputSettings } from '@/components/block-settings';

import { TextFieldBlockDef, TextFieldBlock } from './TextFieldBlock';

// export the config for the block
export const config: BlockConfig<TextFieldBlockDef> = {
    widget: 'text-field',
    data: {
        style: {},
        value: '',
        label: 'Example Input',
        type: 'text',
    },
    listeners: {
        onChange: [],
    },
    slots: {
        content: [],
    },
    render: TextFieldBlock,
    menu: [
        {
            name: 'Text Field',
            children: [
                {
                    description: 'Value',
                    render: ({ id }) => (
                        <InputSettings id={id} label="Value" path="value" />
                    ),
                },
                {
                    description: 'Label',
                    render: ({ id }) => (
                        <InputSettings id={id} label="Label" path="label" />
                    ),
                },
                {
                    description: 'Input Type',
                    render: ({ id }) => {
                        console.log('in config');
                        console.log(id);
                        return (
                            <InputTypeSettings
                                id={id}
                                label="Type"
                                path="type"
                            />
                        );
                    },
                },
            ],
        },
    ],
};
