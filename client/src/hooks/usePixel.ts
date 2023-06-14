import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotification } from '@semoss/components';

import { useRootStore } from './useRootStore';

interface PixelState<D> {
    /** Status of the pixel call */
    status: 'INITIAL' | 'LOADING' | 'SUCCESS' | 'ERROR';
    /** Data returned from the pixel call */
    data?: any;
    /** Error returned from the pixel call */
    error?: Error;
}

interface PixelConfig<D> {
    /** Initial Data */
    data: D;
}

interface usePixel<D> extends PixelState<D> {
    /** Refresh and reexecute the pixel */
    refresh: () => void;
    /** Update the data with new information */
    update: (data: D) => void;
}

/**
 * Send a command to the backend and recieve a response. This is intended to be used by a single pixel statement (nothing seperated by ;)
 *
 * @param pixel - pixel string to call
 *
 * @returns Information about the pixel response
 */
export function usePixel<D>(
    pixel: string,
    config?: Partial<PixelConfig<D>>,
): usePixel<D> {
    const { monolithStore } = useRootStore();
    const notification = useNotification();

    // store the initial config options
    const options: PixelConfig<D> = useMemo(() => {
        return {
            data: undefined,
            ...config,
        };
    }, [config]);

    // store the state
    const [count, setCount] = useState(0);
    const [state, setState] = useState<PixelState<D>>(() => {
        const s: PixelState<D> = {
            status: 'INITIAL',
        };

        if (options.data !== undefined) {
            s.data = options.data;
        }

        return s;
    });

    /**
     * Increment the count, triggering a refresh of the pixel
     */
    const refresh = useCallback(() => {
        setCount(count + 1);
    }, [count]);

    /**
     * Update the data with new data
     */
    const update = useCallback(
        (data: D) => {
            setState({
                ...state,
                data: data,
            });
        },
        [state],
    );

    // get the data
    useEffect(() => {
        // no command reset it
        if (!pixel) {
            setState({
                status: 'INITIAL',
                data: options.data,
            });

            return;
        }

        // track if it has been cancelled
        let isCancelled = false;

        setState({
            status: 'LOADING',
        });

        monolithStore
            .runQuery(pixel)
            .then((response) => {
                // ignore if its cancelled
                if (isCancelled) {
                    return;
                }

                const { output, operationType } = response.pixelReturn[0];

                // track the errors
                if (operationType.indexOf('ERROR') > -1) {
                    const error = output as string;

                    notification.add({
                        color: 'error',
                        content: error,
                    });

                    setState({
                        status: 'ERROR',
                        error: Error(error),
                    });

                    return;
                }

                // set as success
                setState({
                    status: 'SUCCESS',
                    data: output as D,
                });
            })
            .catch((error) => {
                // ignore if its cancelled
                if (isCancelled) {
                    return;
                }

                notification.add({
                    color: 'error',
                    content: error.message,
                });

                setState({
                    status: 'ERROR',
                    error: error,
                });
            });

        return () => {
            isCancelled = true;
        };
    }, [pixel, count]);

    return {
        ...state,
        refresh: refresh,
        update: update,
    };
}
