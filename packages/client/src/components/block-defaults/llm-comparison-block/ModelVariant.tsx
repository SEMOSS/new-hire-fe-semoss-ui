import {
    styled,
    Typography,
    Button,
    Stack,
    Collapse,
    IconButton,
} from '@semoss/ui';
import {
    Add,
    Close,
    ContentCopy,
    PushPinOutlined,
    PushPinRounded,
} from '@mui/icons-material';
import { TypeLlmConfig, TypeVariant } from '../../workspace/workspace.types';
import { useState } from 'react';
import { LlmCard } from './LlmCard';
import { useLLMComparison } from '@/hooks';

const StyledVariantHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const StyledVariantBox = styled('div', {
    shouldForwardProp: (prop) => prop !== 'isVertical',
})<{ isVertical: boolean }>(({ theme, isVertical }) => ({
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.spacing(1.5),
    padding: theme.spacing(2),
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),

    ...(isVertical && {
        flexDirection: 'column',
    }),
}));

const StyledActionBar = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(1),
}));

interface ModelVariantProps {
    index: number;

    click?: (number) => void;

    /** is a part of the default variant used in app */
    isDefault?: boolean;

    /** variant info, the models associated to variant */
    variant: TypeVariant;

    /** sets the orientation for how the models are displayed */
    orientation?: 'column' | 'row';

    /** Props passed to each Llm Card */
    cardProps?: {
        size: 'small' | 'medium';
    };
}

export const ModelVariant = (props: ModelVariantProps) => {
    const {
        index,
        variant,
        isDefault = false,
        orientation = 'column',
        cardProps,
    } = props;
    const [hovered, setHovered] = useState(false);
    const { deleteVariant, editVariant, setDesignerView, setEditorVariant } =
        useLLMComparison();

    const handleToggleSelected = () => {
        const updatedVariant = { ...variant };
        updatedVariant.selected = !variant.selected;
        editVariant(index, updatedVariant);
    };

    const handleOpenVariantEditor = (duplicate: boolean) => {
        setEditorVariant(index, duplicate);
        setDesignerView('variantEdit');
    };

    return (
        <Stack
            direction="column"
            gap={1}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={() => setHovered(false)}
        >
            <StyledVariantHeader>
                <Stack direction="row" alignContent="center">
                    <IconButton onClick={handleToggleSelected}>
                        {variant.selected ? (
                            <PushPinRounded />
                        ) : (
                            <PushPinOutlined />
                        )}
                    </IconButton>
                    <Typography variant="body1" fontWeight="medium">
                        {isDefault
                            ? 'Default Variant'
                            : `Variant ${variant.name}`}
                    </Typography>
                </Stack>

                {index !== -1 && (
                    <IconButton onClick={() => deleteVariant(index)}>
                        <Close />
                    </IconButton>
                )}
            </StyledVariantHeader>

            <StyledVariantBox isVertical={orientation === 'column'}>
                {variant?.models.map((model: TypeLlmConfig, mIdx: number) => (
                    <LlmCard
                        key={`llm-card--variant-${index}--model-${mIdx}`}
                        llm={model}
                        variantIndex={index}
                        modelIndex={mIdx}
                        isDefault={isDefault}
                        size={cardProps?.size ? cardProps.size : 'medium'}
                    />
                ))}
            </StyledVariantBox>

            <Collapse in={hovered}>
                <StyledActionBar>
                    <Button
                        variant="text"
                        color="secondary"
                        onClick={() => handleOpenVariantEditor(false)}
                        startIcon={<Add />}
                    >
                        Add Variant
                    </Button>
                    <Button
                        variant="text"
                        color="secondary"
                        onClick={() => handleOpenVariantEditor(true)}
                        startIcon={<ContentCopy />}
                    >
                        Duplicate
                    </Button>
                </StyledActionBar>
            </Collapse>
        </Stack>
    );
};