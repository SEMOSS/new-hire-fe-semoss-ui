import { useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { styled } from '@semoss/ui';
import { Canvas, useCanvas } from '@semoss/canvas';
import { useDesigner } from '@/hooks';

import {
    getRelativeSize,
    getNearestBlock,
    getNearestBlockElement,
    getNearestSlot,
    getNearestSlotElement,
} from '@/stores';

import { DesignerSelectedMask } from './DesignerSelectedMask';
import { DesignerHoveredMask } from './DesignerHoveredMask';
import { DesignerPlaceholder } from './DesignerPlaceholder';
import { DesignerGhost } from './DesignerGhost';

const StyledContainer = styled('div')(({ theme }) => ({
    position: 'relative',
    height: '100%',
    width: '100%',
    overflow: 'auto',
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    paddingRight: theme.spacing(2),
}));

const StyledContent = styled('div', {
    shouldForwardProp: (prop) => prop !== 'off',
})<{
    /** Track if the drag is on */
    off: boolean;
}>(({ off }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    userSelect: off ? 'none' : 'auto',
    height: '100%',
    width: '100%',
}));

const StyledContentSpacer = styled('div')(({ theme }) => ({
    padding: theme.spacing(1),
    height: '100%',
    width: '100%',
}));

interface DesignerRendererProps {
    /** Id of the block to render */
    blockId: string;
}

export const DesignerRenderer = observer((props: DesignerRendererProps) => {
    const { blockId } = props;

    // save the ref
    const rootRef = useRef<HTMLDivElement | null>(null);

    // get the canvas and designer
    const { canvas } = useCanvas();
    const { designer } = useDesigner();

    /**
     * Handle the mousedown on the page. This will select the nearest block.
     *
     *  @param event - mouse event
     */
    const handleMouseDown = (event: React.MouseEvent) => {
        const id = getNearestBlock(event.target as Element);

        // if there is no id ignore it
        if (!id) {
            return;
        }

        designer.setSelected(id);
    };

    /**
     * Handle the mouseover on the page. This will hover the nearest block.
     *
     *  @param event - mouse event
     */
    const handleMouseOver = (event: React.MouseEvent) => {
        const id = getNearestBlock(event.target as Element);

        // if there is no id ignore it
        if (!id) {
            return;
        }

        designer.setHovered(id);
    };

    /**
     * Handle the mouseleave on the page. This will deselect hovered widgets
     */
    const handleMouseLeave = () => {
        designer.setHovered('');

        // reset the placeholder / clear the ghost if is its off the screen
        if (designer.drag.active) {
            designer.resetPlaceholder();
            designer.updateGhostPosition(null);
        }
    };

    /**
     * Handle the mousemove event on the document. This will render the placeholder based on the target block.
     */
    const handleDocumentMouseMove = useCallback(
        (event: MouseEvent) => {
            // if there is nothing dragged ignore it
            if (!designer.drag.active) {
                return;
            }

            // if there is not root ref ignore it
            if (!rootRef.current) {
                return;
            }

            // prevent the default action (scroll + text selection)
            event.preventDefault();

            // update the ghost
            designer.updateGhostPosition({
                x: event.clientX,
                y: event.clientY,
            });

            // get the nearest element, this will be used to update the position of the place holder
            const nearestElement = getNearestBlockElement(
                event.target as Element,
            );

            if (!nearestElement) {
                return;
            }

            // get the id from the element
            const id = getNearestBlock(nearestElement) as string;

            // set the hovered
            designer.setHovered(id);

            // try to add to the slot if its present
            const slotElement = getNearestSlotElement(event.target as Element);
            if (slotElement) {
                const slot = getNearestSlot(slotElement) as string;

                // check if we can drop
                if (!designer.drag.canDrop(id, slot)) {
                    return;
                }

                // update
                designer.updatePlaceholder(
                    {
                        type: 'replace',
                        id: id,
                        slot: slot,
                    },
                    getRelativeSize(slotElement, rootRef.current),
                );

                return;
            }

            // get the block
            const block = canvas.getBlock(id);

            // if there is no parent, we cannot add
            if (!block.parent) {
                return;
            }

            // check if we can drop
            if (!designer.drag.canDrop(block.parent.id, block.parent.slot)) {
                return;
            }

            // calculate the current percent of the block
            const widgetClientRect = nearestElement.getBoundingClientRect();
            const percent = Math.round(
                ((event.clientY - widgetClientRect.y) /
                    widgetClientRect.height) *
                    100,
            );

            if (percent <= 30) {
                designer.updatePlaceholder(
                    {
                        type: 'before',
                        id: id,
                    },
                    getRelativeSize(nearestElement, rootRef.current),
                );
            } else if (percent >= 70) {
                designer.updatePlaceholder(
                    {
                        type: 'after',
                        id: id,
                    },
                    getRelativeSize(nearestElement, rootRef.current),
                );
            }
        },
        [designer.drag.active, designer.drag.canDrop, designer, canvas],
    );

    // add the mouse up listener when dragged
    useEffect(() => {
        if (!designer.drag.active) {
            return;
        }

        document.addEventListener('mousemove', handleDocumentMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleDocumentMouseMove);
        };
    }, [designer.drag.active, handleDocumentMouseMove]);

    return (
        <StyledContainer data-block="root" ref={rootRef}>
            {designer.selected && <DesignerSelectedMask />}
            {designer.hovered && <DesignerHoveredMask />}
            {designer.drag.active && <DesignerPlaceholder />}
            {designer.drag.active && <DesignerGhost />}

            <StyledContent off={designer.drag.active ? true : false}>
                <StyledContentSpacer onMouseLeave={handleMouseLeave}>
                    <div
                        onMouseDown={handleMouseDown}
                        onMouseOver={handleMouseOver}
                    >
                        <Canvas.Renderer id={blockId} />
                    </div>
                </StyledContentSpacer>
            </StyledContent>
        </StyledContainer>
    );
});
