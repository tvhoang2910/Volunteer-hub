import { useMemo } from "react";

export const useEventReport = (event) => {
    const totalHours = useMemo(() => {
        return (
            event?.volunteers?.reduce((sum, vol) => sum + (vol.hours || 0), 0) || 0
        );
    }, [event]);

    return { totalHours };
};
