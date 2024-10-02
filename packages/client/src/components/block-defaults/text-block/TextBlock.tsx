import React, { CSSProperties, useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';

import { useBlock } from '@/hooks';
import { BlockDef, BlockComponent } from '@/stores';

export interface TextBlockDef extends BlockDef<'text'> {
    widget: 'text';
    data: {
        style: React.CSSProperties;
        text: string;
        animation: boolean;
        variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
    };
    slots: never;
}

export const TextBlock: BlockComponent = observer(({ id }) => {
    const { attrs, data } = useBlock<TextBlockDef>(id);
    const textBoxRef = React.useRef<HTMLElement | null>(null);

    function soumyaFunction(): void {
        const toggleSwitch = data.animation;
        const iterationInput = document.querySelector<HTMLInputElement>(
            'input[type="number"]',
        );
        let animation: Animation | null = null;
        if (!toggleSwitch || !textBoxRef.current || !iterationInput) {
            return;
        }
        const iterations = parseInt(iterationInput.value, 10) || 1;
        if (toggleSwitch) {
            startAnimation(iterations, textBoxRef.current);
        } else {
            stopAnimation();
        }
        function startAnimation(
            iterations: number,
            textBox: HTMLElement,
        ): void {
            if (animation) {
                animation.cancel();
            }
            animation = textBox.animate(
                [
                    { transform: 'translateY(0px)' },
                    { transform: 'translateY(-300px)' },
                ],
                {
                    duration: 1000,
                    iterations: iterations,
                },
            );
        }

        function stopAnimation(): void {
            if (animation) {
                animation.finish();
                animation = null;
            }
        }
    }

    React.useEffect(() => {
        soumyaFunction();
    }, [data.animation]);

    return React.createElement(
        data.variant ? data.variant : 'p',
        {
            ref: textBoxRef,
            style: { ...data.style },
            ...attrs,
        },
        typeof data.text == 'string' ? data.text : JSON.stringify(data.text),
    );
});
