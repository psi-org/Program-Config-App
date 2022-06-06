import { NoticeBox } from '@dhis2/ui';
import { MIN_VERSION, MAX_VERSION } from '../../configs/Constants';


const VersionErrorPage = () => {

    

    return (
        <div>
            <div className="sub_nav">
                <div className="cnt_p"></div>
                <div className="c_srch"></div>
                <div className="c_btns"></div>
            </div>
            <div className="wrapper">
                <div style={{width: '400px', margin: 'auto'}}>
                    <NoticeBox title="The current version of the server is not supported">
                        <p>The server version should be at least <strong>{MIN_VERSION}</strong> and no greater than <strong>{MAX_VERSION}</strong>.</p>
                        <p><br/>Current version is <strong>{window.localStorage.SERVER_VERSION}</strong></p>
                    </NoticeBox>
                </div>
            </div>
        </div>
    );
}

export default VersionErrorPage;

