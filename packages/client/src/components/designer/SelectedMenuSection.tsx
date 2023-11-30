import { ExpandMore } from '@mui/icons-material';
import { Accordion, Stack, Typography, styled } from '@semoss/ui';
import { observer } from 'mobx-react-lite';
import React, { createElement } from 'react';

const StyledMenuSectionHeader = styled('div')(({ theme }) => ({
    alignItems: 'center',
    paddingTop: theme.spacing(1.5),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1.5),
    paddingLeft: theme.spacing(2),
}));

const StyledMenuSection = styled(Accordion)(({ theme }) => ({
    boxShadow: 'none',
    borderRadius: '0 !important',
    border: '0px',
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:before': {
        display: 'none',
    },
    '&.Mui-expanded': {
        margin: '0',
        '&:last-child': {
            borderBottom: '0px',
        },
    },
}));

const StyledMenuSectionTitleTypography = styled(Typography)(() => ({
    textTransform: 'uppercase',
    fontWeight: 'bold',
}));

const StyledMenuSectionTitle = styled(Accordion.Trigger)(({ theme }) => ({
    minHeight: 'auto !important',
    height: theme.spacing(6),
}));

export const SelectedMenuSection = observer(
    (props: {
        id: string;
        sectionTitle: string;
        menu: {
            name: string;
            children: {
                description: string;
                render: (props: { id: string }) => JSX.Element;
            }[];
        }[];
        accordion: object;
        setAccordion: (accordion: object) => void;
    }) => {
        return (
            <Stack>
                <StyledMenuSectionHeader>
                    <Typography variant="subtitle1">
                        {props.sectionTitle}
                    </Typography>
                </StyledMenuSectionHeader>
                {props.menu.map((s, sIdx) => {
                    const key = `section--${sIdx}`;

                    return (
                        <React.Fragment key={key}>
                            <StyledMenuSection
                                expanded={props.accordion[key]}
                                onChange={() =>
                                    props.setAccordion({
                                        ...props.accordion,
                                        [key]: !props.accordion[key],
                                    })
                                }
                            >
                                <StyledMenuSectionTitle
                                    expandIcon={<ExpandMore />}
                                >
                                    <StyledMenuSectionTitleTypography variant="body2">
                                        {s.name}
                                    </StyledMenuSectionTitleTypography>
                                </StyledMenuSectionTitle>
                                <Accordion.Content>
                                    {s.children.length > 0 ? (
                                        <Stack direction="column" spacing={1}>
                                            {s.children.map((c, cIdx) => {
                                                return createElement(c.render, {
                                                    key: cIdx,
                                                    id: props.id,
                                                });
                                            })}
                                        </Stack>
                                    ) : null}
                                </Accordion.Content>
                            </StyledMenuSection>
                        </React.Fragment>
                    );
                })}
            </Stack>
        );
    },
);