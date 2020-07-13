import React, {
    useEffect,
    useRef,
} from 'react';
import { withRouter } from 'react-router';


const AlanBtn: React.FC = (props: any) => {
    const alanBtnComponent = useRef<any>(null);

    useEffect(() => {
        alanBtnComponent.current.addEventListener('command', (data: CustomEvent) => {
            const commandData = data.detail;

            if (commandData.command === 'navigation') {
                props.history.push(`/tab${commandData.tabNumber}`);
            }
        });
    }, []);

    return <alan-button ref={alanBtnComponent} alan-key="aff72382402d0dd0b88fecf4e643f01f2e956eca572e1d8b807a3e2338fdd0dc/stage" />;
};

export default withRouter(AlanBtn);
