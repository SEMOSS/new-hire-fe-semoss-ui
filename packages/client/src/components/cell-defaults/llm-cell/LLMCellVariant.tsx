import { Variant } from '@/stores';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import {
    styled,
    Typography,
    Select,
    Stack,
    TextField,
    Slider,
    Collapse,
    IconButton,
} from '@semoss/ui';
import { useState } from 'react';

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const StyledContent = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
}));

const StyledSelect = styled(Select)(({ theme }) => ({
    width: '100%',
}));

const StyledField = styled('div')(({ theme }) => ({
    paddingBottom: theme.spacing(1),
    wdith: '100%',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    maxWidth: theme.spacing(9),
}));

export interface LLMCellVariantProps {
    allModels: { name: string; id: string }[];
    variantName: string;
    variant: Variant;
}

export const LLMCellVariant = (props: LLMCellVariantProps) => {
    const { allModels, variantName, variant } = props;
    const [open, toggleOpen] = useState(true);

    const handleModelChange = (value) => {
        // TODO
    };

    const handleModelParamsChange = (value, name) => {
        // TODO
    };

    return (
        <div>
            <StyledHeader>
                <Typography variant="subtitle2">
                    {variantName.toLowerCase() === 'default'
                        ? 'Default Variant'
                        : `Variant ${variantName.toUpperCase()}`}
                </Typography>

                <IconButton onClick={() => toggleOpen(!open)}>
                    {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                </IconButton>
            </StyledHeader>

            <Collapse in={open}>
                <StyledContent>
                    <StyledField>
                        <Typography variant="body2">Select Model</Typography>

                        <StyledSelect
                            value={variant.model.id}
                            size="small"
                            onChange={(e) => {
                                handleModelChange(e.target.value);
                            }}
                        >
                            {allModels.map((model, idx) => (
                                <Select.Item
                                    key={`${model.name}-${idx}`}
                                    value={model.id}
                                >
                                    {model.name}
                                </Select.Item>
                            ))}
                        </StyledSelect>
                    </StyledField>

                    <StyledField>
                        <Typography variant="body2">Top P</Typography>

                        <Stack gap={2} direction="row" justifyContent="center">
                            <Slider
                                onChange={(e) =>
                                    handleModelParamsChange(
                                        e.target.value,
                                        'topP',
                                    )
                                }
                                value={variant.model.topP}
                                min={0}
                                max={1}
                                step={0.1}
                                size="small"
                                marks={[
                                    { value: 0, label: '0' },
                                    { value: 1, label: '1' },
                                ]}
                                valueLabelDisplay="auto"
                            />
                            <StyledTextField
                                type="number"
                                size="small"
                                onChange={(e) =>
                                    handleModelParamsChange(
                                        e.target.value,
                                        'topP',
                                    )
                                }
                                value={variant.model.topP}
                            />
                        </Stack>
                    </StyledField>

                    <StyledField>
                        <Typography variant="body2">Temperature</Typography>

                        <Stack gap={2} direction="row" justifyContent="center">
                            <Slider
                                onChange={(e) =>
                                    handleModelParamsChange(
                                        e.target.value,
                                        'temperature',
                                    )
                                }
                                value={variant.model.temperature}
                                min={0}
                                max={1}
                                step={0.1}
                                size="small"
                                marks={[
                                    { value: 0, label: '0' },
                                    { value: 1, label: '1' },
                                ]}
                                valueLabelDisplay="auto"
                            />
                            <StyledTextField
                                type="number"
                                size="small"
                                onChange={(e) =>
                                    handleModelParamsChange(
                                        e.target.value,
                                        'temperature',
                                    )
                                }
                                value={variant.model.temperature}
                            />
                        </Stack>
                    </StyledField>

                    <StyledField>
                        <Typography variant="body2">Token Length</Typography>

                        <Stack gap={2} direction="row" justifyContent="center">
                            <Slider
                                onChange={(e) =>
                                    handleModelParamsChange(
                                        e.target.value,
                                        'length',
                                    )
                                }
                                value={variant.model.length}
                                min={0}
                                max={1}
                                step={1}
                                size="small"
                                marks={[
                                    { value: 0, label: '0' },
                                    { value: 1024, label: '1024' },
                                ]}
                                valueLabelDisplay="auto"
                            />
                            <StyledTextField
                                type="number"
                                size="small"
                                onChange={(e) =>
                                    handleModelParamsChange(
                                        e.target.value,
                                        'length',
                                    )
                                }
                                value={variant.model.length}
                            />
                        </Stack>
                    </StyledField>
                </StyledContent>
            </Collapse>
        </div>
    );
};