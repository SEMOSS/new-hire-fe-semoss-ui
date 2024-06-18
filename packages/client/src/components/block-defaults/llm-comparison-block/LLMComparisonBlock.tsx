import { useState } from 'react';
import { useBlock } from '@/hooks';
import { BlockComponent, BlockDef } from '@/stores';
import { IconButton, Stack, Tabs, Typography, styled } from '@semoss/ui';
import { observer } from 'mobx-react-lite';
import { StarBorder } from '@mui/icons-material';

const StyledLLMComparisonBlock = styled('section')(({ theme }) => ({
    margin: `${theme.spacing(1)} 0`,
    borderRadius: '12px',
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledTabBox = styled(Stack)(({ theme }) => ({
    borderRadius: '12px',
    backgroundColor: theme.palette.background.paper,
    padding: `${theme.spacing(1)} ${theme.spacing(2)} ${theme.spacing(2)}`,
}));

const StyledRatingRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

const StyledStarButton = styled(IconButton)(({ theme }) => ({
    padding: 0,
}));

export interface LLMComparisonBlockDef extends BlockDef<'llmComparison'> {
    widget: 'llmComparison';
    slots: never;
}

// TODO: Temporary Data to build UI with
const fakeData = [
    {
        name: 'A',
        models: ['Vicana'],
        response: (
            <Typography variant="body1">
                IDK what this will look like so heres a string in its place for
                VARIANT A
            </Typography>
        ),
    },
    {
        name: 'B',
        models: ['Dall', 'Vicana'],
        response: (
            <Typography variant="body1">
                IDK what this will look like so heres a string in its place for
                VARIANT B
            </Typography>
        ),
    },
    {
        name: 'C',
        models: ['Dall', 'wizardLM', 'Vicana'],
        response: (
            <Typography variant="body1">
                IDK what this will look like so heres a string in its place for
                VARIANT C
            </Typography>
        ),
    },
];

export const LLMComparisonBlock: BlockComponent = observer(({ id }) => {
    const { data, attrs } = useBlock(id); // TODO: use data here to set the tabs, and data displayed for each tab.
    const [selectedTab, setSelectedTab] = useState('0');
    const displayedRes = fakeData[Number(selectedTab)];

    const handleRateResponse = (num: number) => {
        // TODO: set rating for a variant's response using the rating from the 'num' param.
    };

    return (
        <StyledLLMComparisonBlock {...attrs}>
            <Typography variant="h6">Response</Typography>

            <StyledTabBox gap={2}>
                <Tabs
                    value={selectedTab}
                    onChange={(_, value: string) => {
                        setSelectedTab(value);
                    }}
                    color="primary"
                >
                    {fakeData.map((entry, idx: number) => (
                        <Tabs.Item
                            key={`${entry.name}-${idx}`}
                            label={`Variant ${entry.name}`}
                            value={idx.toString()}
                        />
                    ))}
                </Tabs>

                <Stack direction="column" gap={2}>
                    <Typography color="secondary" variant="body2">
                        {displayedRes.models.length === 1
                            ? 'Model: '
                            : 'Models: '}
                        {displayedRes.models.map((model, idx: number) => {
                            let returnString = model;
                            if (idx + 1 !== displayedRes.models.length)
                                returnString += ', ';
                            return returnString;
                        })}
                    </Typography>

                    <div>{displayedRes.response}</div>

                    <StyledRatingRow>
                        <Typography color="secondary" variant="body2">
                            What would you rate this response?
                        </Typography>

                        <Stack direction="row">
                            <StyledStarButton
                                color="secondary"
                                onClick={() => handleRateResponse(1)}
                            >
                                <StarBorder />
                            </StyledStarButton>
                            <StyledStarButton
                                color="secondary"
                                onClick={() => handleRateResponse(2)}
                            >
                                <StarBorder />
                            </StyledStarButton>
                            <StyledStarButton
                                color="secondary"
                                onClick={() => handleRateResponse(3)}
                            >
                                <StarBorder />
                            </StyledStarButton>
                            <StyledStarButton
                                color="secondary"
                                onClick={() => handleRateResponse(4)}
                            >
                                <StarBorder />
                            </StyledStarButton>
                            <StyledStarButton
                                color="secondary"
                                onClick={() => handleRateResponse(5)}
                            >
                                <StarBorder />
                            </StyledStarButton>
                        </Stack>
                    </StyledRatingRow>
                </Stack>
            </StyledTabBox>
        </StyledLLMComparisonBlock>
    );
});
